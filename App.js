import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StoreProvider, useStore } from './src/store';
import { NavProvider, useNav } from './src/nav';
import { clay, colors } from './src/theme';

import { Legal, Login, Register, Welcome } from './src/screens/auth';
import {
  ClientHome, ClientRequests, LocationScreen, Payment, ProviderDetail, Rate, Report, RequestForm, SearchScreen,
} from './src/screens/client';
import { Account, Chat, Chats, EditProfile, Help, Notifications, RequestDetail } from './src/screens/shared';
import { Premium, ProviderHome, ProviderJobs, ProviderProfileEdit } from './src/screens/provider';
import { AdminDashboard, AdminReports, AdminSupport, AdminVerify } from './src/screens/admin';

// Pantallas que se apilan sobre las pestañas
const STACK_SCREENS = {
  Login, Register, Legal, Location: LocationScreen, ProviderDetail, RequestForm, RequestDetail, Payment, Rate, Report,
  Chat, Notifications, EditProfile, Help, ProviderProfileEdit, Premium,
};

const TABS = {
  guest: [{ key: 'welcome', label: '', icon: '', component: Welcome }],
  cliente: [
    { key: 'home', label: 'Inicio', icon: 'home', component: ClientHome },
    { key: 'search', label: 'Buscar', icon: 'search', component: SearchScreen },
    { key: 'requests', label: 'Solicitudes', icon: 'calendar', component: ClientRequests },
    { key: 'chats', label: 'Mensajes', icon: 'chatbubbles', component: Chats },
    { key: 'account', label: 'Cuenta', icon: 'person', component: Account },
  ],
  prestador: [
    { key: 'home', label: 'Inicio', icon: 'grid', component: ProviderHome },
    { key: 'jobs', label: 'Trabajos', icon: 'briefcase', component: ProviderJobs },
    { key: 'chats', label: 'Mensajes', icon: 'chatbubbles', component: Chats },
    { key: 'account', label: 'Cuenta', icon: 'person', component: Account },
  ],
  admin: [
    { key: 'dashboard', label: 'Panel', icon: 'stats-chart', component: AdminDashboard },
    { key: 'verify', label: 'Verificación', icon: 'shield-checkmark', component: AdminVerify },
    { key: 'reports', label: 'Reportes', icon: 'flag', component: AdminReports },
    { key: 'support', label: 'Soporte', icon: 'help-buoy', component: AdminSupport },
    { key: 'account', label: 'Cuenta', icon: 'person', component: Account },
  ],
};

function Shell({ tabs }) {
  const nav = useNav();
  const { state, me } = useStore();
  const insets = useSafeAreaInsets();
  const current = tabs.find((t) => t.key === nav.tab) || tabs[0];
  const Tab = current.component;
  const top = nav.stack[nav.stack.length - 1];
  const Top = top ? STACK_SCREENS[top.name] : null;
  const showBar = tabs.length > 1;

  const badge = (key) => {
    if (!me) return 0;
    if (me.role === 'prestador' && key === 'jobs') return state.requests.filter((r) => r.providerId === me.providerId && (r.status === 'pendiente' || (r.payment && r.payment.pending))).length;
    if (me.role === 'cliente' && key === 'requests') return state.requests.filter((r) => r.clientId === me.id && ['completada', 'pagada', 'reprogramada'].includes(r.status)).length;
    if (me.role === 'admin' && key === 'verify') return state.providers.filter((p) => !p.verified && !p.rejected).length;
    if (me.role === 'admin' && key === 'reports') return state.reports.filter((r) => r.status === 'abierto').length;
    if (me.role === 'admin' && key === 'support') return (state.tickets || []).filter((t) => t.status === 'abierto').length;
    return 0;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, display: Top ? 'none' : 'flex' }}>
        <Tab key={current.key} />
      </View>
      {Top ? (
        <View style={{ flex: 1 }}>
          <Top key={top.key} params={top.params} />
        </View>
      ) : null}
      {showBar && !Top ? (
        <View style={[s.tabbar, { marginBottom: Math.max(insets.bottom, 10) }]}>
          {tabs.map((t) => {
            const active = t.key === current.key;
            const b = badge(t.key);
            return (
              <Pressable key={t.key} onPress={() => nav.setTab(t.key)} style={s.tabItem}>
                <View style={[s.tabPill, active && clay(colors.accentSoft, { tint: colors.accent, depth: 0.4, strong: 0.25 })]}>
                  <Ionicons name={active ? t.icon : `${t.icon}-outline`} size={22} color={active ? colors.accentDark : colors.textMuted} />
                  {b ? <View style={s.badge}><Text style={s.badgeText}>{b}</Text></View> : null}
                </View>
                <Text style={[s.tabLabel, active && { color: colors.primary, fontWeight: '800' }]} numberOfLines={1}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function Toast() {
  const { toast, setToast } = useStore();
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(-160)).current;
  useEffect(() => {
    if (!toast) return;
    Animated.spring(y, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
    const t = setTimeout(() => {
      Animated.timing(y, { toValue: -160, duration: 250, useNativeDriver: true }).start(() => setToast(null));
    }, 3600);
    return () => clearTimeout(t);
  }, [toast && toast.key]);
  if (!toast) return null;
  return (
    <Animated.View pointerEvents="box-none" style={[s.toastWrap, { top: insets.top + 6, transform: [{ translateY: y }] }]}>
      <Pressable onPress={() => setToast(null)} style={s.toast}>
        <View style={s.toastIcon}><Ionicons name="notifications" size={18} color="#fff" /></View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ fontWeight: '800', color: colors.text }}>{toast.title}</Text>
          {toast.body ? <Text style={{ color: colors.textSoft, marginTop: 2 }} numberOfLines={2}>{toast.body}</Text> : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

// Pantalla cuando no hay conexión con la API / MySQL
function ConnectionScreen() {
  const { connError, actions } = useStore();
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.connWrap, { paddingTop: insets.top + 40 }]}>
      <View style={s.connIcon}><Ionicons name="cloud-offline-outline" size={40} color={colors.accent} /></View>
      <Text style={s.connTitle}>Sin conexión con el servidor</Text>
      <Text style={s.connText}>{connError || 'Conectando con la base de datos…'}</Text>
      <Text style={s.connHint}>
        Verifica que Expo siga corriendo en tu computadora y que MySQL esté encendido (por ejemplo, desde XAMPP).
      </Text>
      <Pressable onPress={actions.retry} style={s.connBtn}><Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Reintentar</Text></Pressable>
      <Pressable onPress={actions.logout} style={{ marginTop: 14, padding: 8 }}><Text style={{ color: colors.textSoft, fontWeight: '600' }}>Cerrar sesión</Text></Pressable>
    </View>
  );
}

function Root() {
  const { me, loadingSession, connError } = useStore();
  const role = me ? me.role : 'guest';
  const tabs = TABS[role];
  if (loadingSession) return <ConnectionScreen />;
  return (
    <>
      <StatusBar style={role === 'guest' ? 'light' : 'dark'} />
      {/* key reinicia la navegación al cambiar de sesión */}
      <NavProvider key={me ? me.id : 'guest'} initialTab={tabs[0].key}>
        <Shell tabs={tabs} />
      </NavProvider>
      <Toast />
      {me && connError ? (
        <View style={s.offline}><Ionicons name="cloud-offline-outline" size={14} color="#fff" /><Text style={s.offlineText}>Sin conexión con el servidor · reintentando…</Text></View>
      ) : null}
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Root />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  tabbar: { flexDirection: 'row', marginHorizontal: 14, paddingVertical: 9, borderRadius: 32, ...clay(colors.card, { strong: 0.2 }) },
  tabPill: { width: 56, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  tabItem: { flex: 1, alignItems: 'center' },
  tabLabel: { fontSize: 11.5, color: colors.textMuted, marginTop: 4, fontWeight: '600' },
  badge: { position: 'absolute', top: -3, right: 2, minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, ...clay(colors.danger, { tint: colors.danger, depth: 0.25, strong: 0.4 }) },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  connWrap: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', paddingHorizontal: 28 },
  connIcon: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center', ...clay(colors.accentSoft, { tint: colors.accent }) },
  connTitle: { fontSize: 21, fontWeight: '800', color: colors.text, marginTop: 18, textAlign: 'center' },
  connText: { color: colors.textSoft, marginTop: 8, textAlign: 'center', lineHeight: 21, fontSize: 15 },
  connHint: { color: colors.textMuted, marginTop: 12, textAlign: 'center', lineHeight: 19, fontSize: 13 },
  connBtn: { marginTop: 26, borderRadius: 22, paddingHorizontal: 38, paddingVertical: 16, ...clay(colors.primary, { strong: 0.3 }) },
  offline: { position: 'absolute', bottom: 100, alignSelf: 'center', zIndex: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, ...clay(colors.danger, { tint: colors.danger, depth: 0.4, strong: 0.35 }) },
  offlineText: { color: '#fff', fontWeight: '700', fontSize: 12, marginLeft: 6 },
  toastWrap: { position: 'absolute', left: 12, right: 12, zIndex: 100, elevation: 20 },
  toast: { flexDirection: 'row', alignItems: 'center', borderRadius: 24, padding: 14, ...clay(colors.card, { strong: 0.25 }) },
  toastIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', ...clay(colors.accent, { tint: colors.accent, depth: 0.4, strong: 0.3 }) },
});
