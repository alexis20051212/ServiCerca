import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

// Los datos viven en MySQL (a través de la API). En el teléfono solo se guarda
// la sesión (token) y las preferencias de ubicación.
const SESSION_KEY = 'servicerca_session_v2';
const POLL_MS = 3000;

export const ratingOf = (p) => {
  if (!p || !p.reviews || p.reviews.length === 0) return 0;
  return p.reviews.reduce((s, x) => s + x.rating, 0) / p.reviews.length;
};

export const convKey = (clientId, providerId) => `${clientId}__${providerId}`;

const EMPTY = { users: [], providers: [], requests: [], messages: {}, notifications: [], reports: [], tickets: [], meId: null };

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState(null);
  const [data, setData] = useState(EMPTY);
  const [prefs, setPrefs] = useState({ locationAllowed: false, myZone: 'Centro' });
  const [toast, setToast] = useState(null);
  const [connError, setConnError] = useState(null);
  const tokenRef = useRef(null);
  const seenNtf = useRef(null);
  tokenRef.current = token;

  const showToast = useCallback((title, body) => setToast({ title, body, key: `${Date.now()}${Math.random()}` }), []);

  const saveSession = async (t, p) => {
    try {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ token: t, ...p }));
    } catch (e) {}
  };

  const clearSession = useCallback(() => {
    setToken(null);
    tokenRef.current = null;
    seenNtf.current = null;
    setData(EMPTY);
  }, []);

  // Descarga el estado desde la API/MySQL
  const refresh = useCallback(async (t = tokenRef.current) => {
    if (!t) return;
    try {
      const snap = await api('/state', { token: t });
      if (tokenRef.current !== t) return;
      // Avisos emergentes para notificaciones nuevas
      const ids = snap.notifications.map((n) => n.id);
      if (seenNtf.current) {
        const fresh = snap.notifications.filter((n) => !seenNtf.current.has(n.id) && !n.read);
        if (fresh.length) setToast({ title: fresh[0].title, body: fresh[0].body, key: fresh[0].id });
      }
      seenNtf.current = new Set(ids);
      setData(snap);
      setConnError(null);
    } catch (e) {
      if (e.status === 401) {
        clearSession();
        saveSession(null, prefs);
      } else {
        setConnError(e.message);
      }
    }
  }, [clearSession, prefs]);

  // Arranque: recuperar sesión guardada
  useEffect(() => {
    (async () => {
      let saved = {};
      try {
        saved = JSON.parse((await AsyncStorage.getItem(SESSION_KEY)) || '{}');
      } catch (e) {}
      const p = { locationAllowed: !!saved.locationAllowed, myZone: saved.myZone || 'Centro' };
      setPrefs(p);
      if (saved.token) {
        setToken(saved.token);
        tokenRef.current = saved.token;
        await refresh(saved.token);
      }
      setReady(true);
    })();
  }, []);

  // Sincronización periódica (otros dispositivos, prestadores simulados, etc.)
  useEffect(() => {
    if (!token) return;
    const t = setInterval(() => refresh(), POLL_MS);
    return () => clearInterval(t);
  }, [token, refresh]);

  // Ejecuta una acción en la API y vuelve a sincronizar
  const call = useCallback(async (path, opts = {}, { silent } = {}) => {
    try {
      const res = await api(path, { ...opts, token: tokenRef.current });
      await refresh();
      return { ok: true, ...res };
    } catch (e) {
      if (!silent) showToast('No se pudo completar', e.message);
      return { ok: false, error: e.message };
    }
  }, [refresh, showToast]);

  const startSession = async (res) => {
    setToken(res.token);
    tokenRef.current = res.token;
    seenNtf.current = null;
    await saveSession(res.token, prefs);
    await refresh(res.token);
  };

  const actions = useMemo(
    () => ({
      async login(email, password) {
        try {
          const res = await api('/login', { method: 'POST', body: { email, password } });
          await startSession(res);
          return null;
        } catch (e) {
          return e.message;
        }
      },

      async register(form) {
        try {
          const res = await api('/register', { method: 'POST', body: form });
          await startSession(res);
          return null;
        } catch (e) {
          return e.message;
        }
      },

      async logout() {
        const t = tokenRef.current;
        clearSession();
        await saveSession(null, prefs);
        if (t) api('/logout', { method: 'POST', token: t }).catch(() => {});
      },

      updateUser: (patch) => call('/me', { method: 'PATCH', body: patch }),

      async deleteAccount() {
        const r = await call('/me', { method: 'DELETE' });
        if (r.ok) {
          clearSession();
          await saveSession(null, prefs);
        }
      },

      updateProvider: (id, patch) => call(`/providers/${id}`, { method: 'PATCH', body: patch }),

      async setLocation(allowed, zone) {
        const p = { locationAllowed: allowed, myZone: zone || prefs.myZone };
        setPrefs(p);
        await saveSession(tokenRef.current, p);
      },

      async createRequest(form) {
        const r = await call('/requests', { method: 'POST', body: form });
        return r.ok ? r.id : null;
      },

      providerUpdate: (id, status, extra = {}) =>
        call(`/requests/${id}/status`, { method: 'POST', body: { status, date: extra.date, time: extra.time } }),
      cancelRequest: (id) => call(`/requests/${id}/status`, { method: 'POST', body: { status: 'cancelada' } }),
      acceptReschedule: (id) => call(`/requests/${id}/status`, { method: 'POST', body: { status: 'aceptada' } }),
      payRequest: (id, method) => call(`/requests/${id}/pay`, { method: 'POST', body: { method } }),
      rateClient: (id, rating, comment) => call(`/requests/${id}/rate-client`, { method: 'POST', body: { rating, comment } }),
      confirmCash: (id) => call(`/requests/${id}/confirm-cash`, { method: 'POST' }),
      rateRequest: (id, rating, comment) => call(`/requests/${id}/rate`, { method: 'POST', body: { rating, comment } }),
      sendMessage: (clientId, providerId, text) => call('/messages', { method: 'POST', body: { clientId, providerId, text } }),
      markNotificationsRead: () => call('/notifications/read', { method: 'POST' }, { silent: true }),
      reportProvider: (providerId, reason, detail) => call('/reports', { method: 'POST', body: { providerId, reason, detail } }),
      resolveReport: (id, resolution) => call(`/reports/${id}/resolve`, { method: 'POST', body: { resolution } }),
      verifyProvider: (id, approve) => call(`/providers/${id}/verify`, { method: 'POST', body: { approve } }),
      toggleSuspend: (id) => call(`/providers/${id}/suspend`, { method: 'POST' }),
      buyPremium: (providerId, plan) => call('/premium', { method: 'POST', body: { plan } }),
      cancelPremium: () => call('/premium', { method: 'DELETE' }),
      replyTicket: (id, reply) => call(`/support/${id}/reply`, { method: 'POST', body: { reply } }),
      reopenTicket: (id) => call(`/support/${id}/reopen`, { method: 'POST' }),
      sendSupport: (message) => call('/support', { method: 'POST', body: { message } }),

      async resetDemo() {
        try {
          await api('/reset', { method: 'POST' });
        } catch (e) {
          return showToast('No se pudo reiniciar', e.message);
        }
        clearSession();
        await saveSession(null, prefs);
        showToast('Base de datos reiniciada', 'Se restauraron los datos de demostración.');
      },

      retry: () => refresh(),
    }),
    [call, clearSession, prefs, refresh, showToast]
  );

  if (!ready) return null;

  const state = { ...data, currentUserId: token ? data.meId : null, ...prefs };
  const me = token ? data.users.find((u) => u.id === data.meId) || null : null;
  const loadingSession = !!token && !me;

  return (
    <Ctx.Provider value={{ state, me, actions, toast, setToast, showToast, connError, loadingSession }}>
      {children}
    </Ctx.Provider>
  );
}

export const useStore = () => useContext(Ctx);
