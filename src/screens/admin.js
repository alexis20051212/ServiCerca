import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Badge, CategoryIcon, Button, Card, Empty, Input, Screen, SectionTitle, confirm } from '../components';
import { clay, colors, money, sunken } from '../theme';
import { useNav } from '../nav';
import { ratingOf, useStore } from '../store';
import { CATEGORIES, categoryById } from '../data';
import { sharedStyles } from './client';
import { TicketCard } from './shared';

export function AdminDashboard() {
  const { state } = useStore();
  const nav = useNav();
  const providers = state.providers;
  const clients = state.users.filter((u) => u.role === 'cliente').length;
  const verified = providers.filter((p) => p.verified).length;
  const pendingVer = providers.filter((p) => !p.verified && !p.rejected).length;
  const openReports = state.reports.filter((r) => r.status === 'abierto').length;
  const openTickets = (state.tickets || []).filter((t) => t.status === 'abierto').length;
  const paid = state.requests.filter((r) => r.payment && !r.payment.pending);
  const gmv = paid.reduce((s, r) => s + r.payment.total, 0);
  const commissions = paid.reduce((s, r) => s + r.payment.commission, 0);
  const allReviews = providers.flatMap((p) => p.reviews);
  const avg = allReviews.length ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length : 0;
  const byCat = CATEGORIES.map((c) => ({ ...c, n: providers.filter((p) => p.category === c.id && p.verified).length }));
  const maxCat = Math.max(1, ...byCat.map((c) => c.n));

  return (
    <Screen title="Panel de administración" subtitle="Indicadores del MVP · ciudad piloto">
      <View style={s.grid}>
        <Kpi icon="people-outline" value={clients} label="Clientes" goal="Meta: 1,000" />
        <Kpi icon="construct-outline" value={verified} label="Prestadores verificados" goal="Meta: 100" />
        <Kpi icon="star-outline" value={avg.toFixed(2)} label="Calificación promedio" goal="Meta: ≥ 4.0" ok={avg >= 4} />
        <Kpi icon="receipt-outline" value={state.requests.length} label="Solicitudes" />
        <Kpi icon="cash-outline" value={money(gmv)} label="Pagado en la app" />
        <Kpi icon="trending-up-outline" value={money(commissions)} label="Comisiones" />
      </View>

      {pendingVer || openReports || openTickets ? (
        <Card style={{ marginTop: 6, backgroundColor: colors.warningSoft, borderColor: 'transparent' }}>
          <Text style={{ fontWeight: '800', color: colors.text, marginBottom: 8 }}>Pendientes de atención</Text>
          {pendingVer ? (
            <Pressable onPress={() => nav.setTab('verify')} style={s.alertRow}>
              <Ionicons name="id-card-outline" size={18} color={colors.warning} />
              <Text style={{ flex: 1, marginLeft: 8, color: colors.text }}>{pendingVer} prestador(es) por verificar</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </Pressable>
          ) : null}
          {openReports ? (
            <Pressable onPress={() => nav.setTab('reports')} style={s.alertRow}>
              <Ionicons name="flag-outline" size={18} color={colors.danger} />
              <Text style={{ flex: 1, marginLeft: 8, color: colors.text }}>{openReports} reporte(s) abiertos</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </Pressable>
          ) : null}
          {openTickets ? (
            <Pressable onPress={() => nav.setTab('support')} style={s.alertRow}>
              <Ionicons name="help-buoy-outline" size={18} color={colors.primary} />
              <Text style={{ flex: 1, marginLeft: 8, color: colors.text }}>{openTickets} ticket(s) de soporte abiertos</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </Card>
      ) : null}

      <SectionTitle>Prestadores por categoría</SectionTitle>
      <Card>
        {byCat.map((c) => (
          <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
            <View style={{ width: 26 }}><CategoryIcon category={c} size={15} /></View>
            <Text style={{ width: 120, color: colors.text, fontSize: 13 }} numberOfLines={1}>{c.name}</Text>
            <View style={s.barBg}><View style={[s.bar, { width: `${(c.n / maxCat) * 100}%`, backgroundColor: c.color }]} /></View>
            <Text style={{ width: 24, textAlign: 'right', fontWeight: '700', color: colors.text }}>{c.n}</Text>
          </View>
        ))}
      </Card>

      <SectionTitle>Prestadores</SectionTitle>
      <AdminProvidersList />
    </Screen>
  );
}

function Kpi({ icon, value, label, goal, ok }) {
  return (
    <View style={{ width: '50%', padding: 4 }}>
      <Card style={{ minHeight: 112 }}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, marginTop: 6 }} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
        <Text style={{ color: colors.textSoft, fontSize: 12 }}>{label}</Text>
        {goal ? <Text style={{ color: ok ? colors.success : colors.textMuted, fontSize: 11, marginTop: 2 }}>{goal}</Text> : null}
      </Card>
    </View>
  );
}

function AdminProvidersList() {
  const { state, actions } = useStore();
  const nav = useNav();
  return state.providers.filter((p) => p.verified).map((p) => (
    <Card key={p.id} style={{ marginBottom: 8, paddingVertical: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Avatar name={p.name} size={38} color={categoryById(p.category).color} logo={categoryById(p.category).logo} />
        <Pressable style={{ flex: 1, marginLeft: 10 }} onPress={() => nav.push('ProviderDetail', { id: p.id })}>
          <Text style={{ fontWeight: '700', color: colors.text }} numberOfLines={1}>{p.name}</Text>
          <Text style={{ color: colors.textSoft, fontSize: 12 }}>{categoryById(p.category).name} · ★ {ratingOf(p).toFixed(1)}</Text>
        </Pressable>
        <Button small title={p.active ? 'Suspender' : 'Reactivar'} variant={p.active ? 'danger' : 'ghost'}
          onPress={() => confirm(p.active ? 'Suspender prestador' : 'Reactivar prestador', p.name, () => actions.toggleSuspend(p.id), p.active ? 'Suspender' : 'Reactivar', p.active)} />
      </View>
    </Card>
  ));
}

export function AdminVerify() {
  const { state, actions, showToast } = useStore();
  const pending = state.providers.filter((p) => !p.verified && !p.rejected);
  return (
    <Screen title="Verificación" subtitle="Revisión de identidad y documentos" large>
      {pending.map((p) => {
        const c = categoryById(p.category);
        const u = state.users.find((x) => x.id === p.userId);
        return (
          <Card key={p.id} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar name={p.name} color={c.color} logo={c.logo} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontWeight: '800', color: colors.text }}>{p.name}</Text>
                <Text style={{ color: colors.textSoft, fontSize: 13 }}>{c.name} · {p.zone} · {p.years} años</Text>
                <Text style={{ color: colors.textSoft, fontSize: 13 }}>{u ? u.email : p.phone}</Text>
              </View>
            </View>
            <View style={s.docs}>
              {(p.documents || []).map((d) => (
                <View key={d} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 3 }}>
                  <Ionicons name="document-attach-outline" size={16} color={colors.primary} />
                  <Text style={{ marginLeft: 6, color: colors.text, flex: 1 }}>{d}</Text>
                  <Badge label="Recibido" color={colors.success} bg={colors.successSoft} />
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <Button title="Rechazar" variant="danger" small style={{ flex: 1, marginRight: 8 }}
                onPress={() => { actions.verifyProvider(p.id, false); showToast('Prestador rechazado', p.name); }} />
              <Button title="Aprobar" variant="success" icon="shield-checkmark-outline" small style={{ flex: 1.4 }}
                onPress={() => { actions.verifyProvider(p.id, true); showToast('Prestador verificado', `${p.name} ya es visible para los clientes.`); }} />
            </View>
          </Card>
        );
      })}
      {!pending.length ? <Empty icon="shield-checkmark-outline" title="Todo al día" text="No hay prestadores pendientes de verificación." /> : null}
    </Screen>
  );
}

export function AdminReports() {
  const { state, actions, showToast } = useStore();
  const [tab, setTab] = useState('abierto');
  const list = state.reports.filter((r) => r.status === tab);
  return (
    <Screen title="Reportes" subtitle="Quejas de clientes" large>
      <View style={sharedStyles.segment}>
        {[['abierto', 'Abiertos'], ['resuelto', 'Resueltos']].map(([k, l]) => (
          <Pressable key={k} onPress={() => setTab(k)} style={[sharedStyles.segBtn, tab === k && sharedStyles.segActive]}>
            <Text style={[sharedStyles.segText, tab === k && { color: colors.primary }]}>{l}</Text>
          </Pressable>
        ))}
      </View>
      {list.map((r) => {
        const p = state.providers.find((x) => x.id === r.providerId);
        return (
          <Card key={r.id} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="flag" size={18} color={colors.danger} />
              <Text style={{ flex: 1, marginLeft: 8, fontWeight: '800', color: colors.text }}>{r.reason}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{r.date}</Text>
            </View>
            <Text style={{ color: colors.textSoft, marginTop: 6 }}>Prestador: <Text style={{ color: colors.text, fontWeight: '700' }}>{p ? p.name : '—'}</Text></Text>
            <Text style={{ color: colors.textSoft }}>Reportado por: {r.author}</Text>
            {r.detail ? <Text style={{ color: colors.text, marginTop: 6, lineHeight: 20 }}>"{r.detail}"</Text> : null}
            {r.resolution ? <Text style={{ color: colors.success, marginTop: 6, fontWeight: '600' }}>Resolución: {r.resolution}</Text> : null}
            {r.status === 'abierto' ? (
              <View style={{ flexDirection: 'row', marginTop: 12 }}>
                <Button title="Advertir" small variant="ghost" style={{ flex: 1, marginRight: 8 }}
                  onPress={() => { actions.resolveReport(r.id, 'Advertencia enviada al prestador'); showToast('Reporte resuelto', 'Se envió una advertencia.'); }} />
                <Button title="Suspender" small variant="danger" style={{ flex: 1 }}
                  onPress={() => confirm('Suspender prestador', `${p ? p.name : ''} dejará de aparecer en las búsquedas.`, () => {
                    if (p && p.active) actions.toggleSuspend(p.id);
                    actions.resolveReport(r.id, 'Prestador suspendido');
                  }, 'Suspender', true)} />
              </View>
            ) : null}
          </Card>
        );
      })}
      {!list.length ? <Empty icon="flag-outline" title="Sin reportes" /> : null}
    </Screen>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  alertRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 18, marginTop: 8, ...clay(colors.card, { depth: 0.5 }) },
  barBg: { flex: 1, height: 10, borderRadius: 5, overflow: 'hidden', marginHorizontal: 8, ...sunken },
  bar: { height: 8, borderRadius: 4 },
  docs: { borderRadius: 20, padding: 12, marginTop: 14, ...sunken },
});

export function AdminSupport() {
  const { state, actions, showToast } = useStore();
  const [tab, setTab] = useState('abierto');
  const [replies, setReplies] = useState({});
  const all = state.tickets || [];
  const list = all.filter((t) => t.status === tab);
  return (
    <Screen title="Soporte" subtitle="Tickets de clientes y prestadores" large>
      <View style={sharedStyles.segment}>
        {[['abierto', `Abiertos (${all.filter((t) => t.status === 'abierto').length})`], ['resuelto', 'Resueltos']].map(([k, l]) => (
          <Pressable key={k} onPress={() => setTab(k)} style={[sharedStyles.segBtn, tab === k && sharedStyles.segActive]}>
            <Text style={[sharedStyles.segText, tab === k && { color: colors.primary }]}>{l}</Text>
          </Pressable>
        ))}
      </View>
      {list.map((t) => (
        <TicketCard key={t.id} t={t} admin>
          {t.status === 'abierto' ? (
            <View style={{ marginTop: 12 }}>
              <Input value={replies[t.id] || ''} onChangeText={(v) => setReplies({ ...replies, [t.id]: v })} multiline placeholder="Escribe una respuesta para el usuario" />
              <Button title="Responder y cerrar" icon="send-outline" small
                onPress={async () => {
                  const r = await actions.replyTicket(t.id, (replies[t.id] || '').trim());
                  if (r.ok) { setReplies({ ...replies, [t.id]: '' }); showToast('Ticket resuelto', `Se notificó a ${t.userName}.`); }
                }} />
            </View>
          ) : (
            <Button title="Reabrir" small variant="ghost" style={{ marginTop: 12, alignSelf: 'flex-start' }} onPress={() => actions.reopenTicket(t.id)} />
          )}
        </TicketCard>
      ))}
      {!list.length ? <Empty icon="help-buoy-outline" title={tab === 'abierto' ? 'Sin tickets pendientes' : 'Sin tickets resueltos'} text="Aquí aparecen los mensajes enviados desde el Centro de ayuda." /> : null}
    </Screen>
  );
}
