import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Badge, Button, Card, Chip, Empty, Input, Logo, Screen, SectionTitle, confirm } from '../components';
import { clay, colors, COMMISSION, money, radius, sunken } from '../theme';
import { useNav } from '../nav';
import { ratingOf, useStore } from '../store';
import { CATEGORIES, categoryById, ZONES } from '../data';
import { RequestCard, sharedStyles } from './client';

const IN_PROGRESS = ['aceptada', 'reprogramada', 'en_camino', 'en_proceso', 'completada'];

export function ProviderHome() {
  const { state, me, actions } = useStore();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const p = state.providers.find((x) => x.id === me.providerId);
  if (!p) return <Screen title="Inicio"><Empty title="Perfil no encontrado" /></Screen>;
  const mine = state.requests.filter((r) => r.providerId === p.id);
  const pending = mine.filter((r) => r.status === 'pendiente');
  const current = mine.filter((r) => IN_PROGRESS.includes(r.status));
  const paid = mine.filter((r) => r.payment && !r.payment.pending);
  const earnings = paid.reduce((s, r) => s + r.payment.total - r.payment.commission, 0);
  const unread = state.notifications.filter((n) => n.userId === me.id && !n.read).length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={[s.hero, { paddingTop: insets.top + 14 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
          <View style={{ flex: 1 }}><Logo height={32} /></View>
          <Pressable onPress={() => nav.push('Notifications')} style={s.bell}>
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
            {unread ? <View style={s.dot}><Text style={s.dotText}>{unread}</Text></View> : null}
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Avatar name={p.name} size={60} color={categoryById(p.category).color} logo={categoryById(p.category).logo} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ color: colors.textSoft, fontSize: 14 }}>Panel del prestador</Text>
            <Text style={{ color: colors.text, fontSize: 21, fontWeight: '800', marginTop: 1 }} numberOfLines={1}>{p.name}</Text>
            <Text style={{ color: colors.accentDark, marginTop: 2, fontWeight: '600' }}>{categoryById(p.category).role || categoryById(p.category).name} · {p.zone}</Text>
          </View>
        </View>
        <View style={s.availRow}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '800', color: colors.text }}>{p.active ? 'Disponible para trabajos' : 'No disponible'}</Text>
            <Text style={{ color: colors.textSoft, fontSize: 12 }}>{p.active ? 'Los clientes pueden encontrarte' : 'Tu perfil está oculto'}</Text>
          </View>
          <Switch value={p.active} onValueChange={(v) => actions.updateProvider(p.id, { active: v })}
            trackColor={{ true: colors.success, false: colors.border }} thumbColor="#fff" />
        </View>
      </View>

      <View style={{ padding: 18 }}>
        {!p.verified ? (
          <Card style={{ backgroundColor: p.rejected ? colors.dangerSoft : colors.warningSoft, borderColor: 'transparent', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row' }}>
              <Ionicons name={p.rejected ? 'alert-circle' : 'hourglass-outline'} size={22} color={p.rejected ? colors.danger : colors.warning} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontWeight: '800', color: colors.text }}>{p.rejected ? 'Verificación rechazada' : 'Perfil en verificación'}</Text>
                <Text style={{ color: colors.textSoft, marginTop: 2, lineHeight: 19 }}>
                  {p.rejected
                    ? 'Revisa tus documentos y contacta a soporte para volver a enviarlos.'
                    : 'Estamos revisando tu identificación y comprobante de domicilio. Mientras tanto, completa tu perfil profesional.'}
                </Text>
                <Button title="Completar perfil" small variant="ghost" style={{ marginTop: 10, alignSelf: 'flex-start' }} onPress={() => nav.push('ProviderProfileEdit')} />
              </View>
            </View>
          </Card>
        ) : null}

        <View style={{ flexDirection: 'row', marginBottom: 6 }}>
          <Stat icon="wallet-outline" color={colors.success} value={money(earnings)} label="Ganancias" />
          <Stat icon="star-outline" color={colors.accent} value={ratingOf(p) ? ratingOf(p).toFixed(1) : '—'} label={`${p.reviews.length} reseñas`} />
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 6 }}>
          <Stat icon="mail-unread-outline" color={colors.warning} value={pending.length} label="Nuevas" />
          <Stat icon="checkmark-done-outline" color={colors.primary} value={paid.length} label="Completadas" />
        </View>

        <SectionTitle action={pending.length ? 'Ver todas' : null} onAction={() => nav.setTab('jobs')}>Solicitudes nuevas</SectionTitle>
        {pending.slice(0, 3).map((r) => <RequestCard key={r.id} req={r} showClient onPress={() => nav.push('RequestDetail', { id: r.id })} />)}
        {!pending.length ? (
          <Card><Text style={{ color: colors.textSoft }}>No tienes solicitudes nuevas por ahora. Te notificaremos cuando llegue una.</Text></Card>
        ) : null}

        {current.length ? (
          <>
            <SectionTitle>Trabajos en curso</SectionTitle>
            {current.map((r) => <RequestCard key={r.id} req={r} showClient onPress={() => nav.push('RequestDetail', { id: r.id })} />)}
          </>
        ) : null}

        {!p.premium ? (
          <Card style={s.premiumCard} onPress={() => nav.push('Premium')}>
            <Ionicons name="ribbon" size={28} color={colors.accentDark} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: '900', color: colors.text }}>Hazte Premium</Text>
              <Text style={{ color: colors.textSoft, fontSize: 13, marginTop: 2 }}>Aparece primero en las búsquedas y consigue más clientes.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.accentDark} />
          </Card>
        ) : null}
      </View>
    </ScrollView>
  );
}

function Stat({ icon, color, value, label }) {
  return (
    <Card style={{ flex: 1, marginHorizontal: 3, marginBottom: 6 }}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, marginTop: 6 }}>{value}</Text>
      <Text style={{ color: colors.textSoft, fontSize: 12 }}>{label}</Text>
    </Card>
  );
}

export function ProviderJobs() {
  const { state, me } = useStore();
  const nav = useNav();
  const [tab, setTab] = useState('nuevas');
  const mine = state.requests.filter((r) => r.providerId === me.providerId);
  const groups = {
    nuevas: mine.filter((r) => r.status === 'pendiente'),
    curso: mine.filter((r) => IN_PROGRESS.includes(r.status)),
    historial: mine.filter((r) => ['pagada', 'calificada', 'rechazada', 'cancelada'].includes(r.status)),
  };
  const list = groups[tab];
  return (
    <Screen title="Trabajos" large>
      <View style={sharedStyles.segment}>
        {[['nuevas', `Nuevas (${groups.nuevas.length})`], ['curso', 'En curso'], ['historial', 'Historial']].map(([k, l]) => (
          <Pressable key={k} onPress={() => setTab(k)} style={[sharedStyles.segBtn, tab === k && sharedStyles.segActive]}>
            <Text style={[sharedStyles.segText, tab === k && { color: colors.primary }]}>{l}</Text>
          </Pressable>
        ))}
      </View>
      {list.map((r) => <RequestCard key={r.id} req={r} showClient onPress={() => nav.push('RequestDetail', { id: r.id })} />)}
      {!list.length ? <Empty icon="briefcase-outline" title="Nada por aquí" text="Las solicitudes de tus clientes aparecerán en esta sección." /> : null}
    </Screen>
  );
}

export function ProviderProfileEdit() {
  const { state, me, actions, showToast } = useStore();
  const nav = useNav();
  const p = state.providers.find((x) => x.id === me.providerId);
  const [f, setF] = useState({
    description: p.description, rate: String(p.rate), schedule: p.schedule, zone: p.zone, category: p.category,
    services: [...p.services], years: String(p.years),
  });
  const [newService, setNewService] = useState('');
  const addService = () => {
    const v = newService.trim();
    if (v && !f.services.includes(v)) setF({ ...f, services: [...f.services, v] });
    setNewService('');
  };
  const save = () => {
    actions.updateProvider(p.id, {
      description: f.description.trim(), rate: Number(f.rate) || p.rate, schedule: f.schedule.trim(), zone: f.zone,
      category: f.category, services: f.services, years: Number(f.years) || p.years,
    });
    showToast('Perfil actualizado', 'Los cambios ya son visibles para los clientes.');
    nav.back();
  };

  return (
    <Screen title="Perfil profesional" back footer={<Button title="Guardar perfil" icon="save-outline" onPress={save} />}>
      <Text style={s.label}>Categoría</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
        {CATEGORIES.map((c) => <Chip key={c.id} label={c.name} icon={c.icon} logo={c.logo} active={f.category === c.id} onPress={() => setF({ ...f, category: c.id })} />)}
      </ScrollView>
      <Input label="Descripción" value={f.description} onChangeText={(t) => setF({ ...f, description: t })} multiline placeholder="Cuéntales a los clientes sobre tu experiencia" />
      <View style={{ flexDirection: 'row' }}>
        <Input style={{ flex: 1, marginRight: 10 }} label="Tarifa por visita ($)" icon="cash-outline" value={f.rate} keyboardType="numeric" onChangeText={(t) => setF({ ...f, rate: t.replace(/\D/g, '') })} />
        <Input style={{ flex: 1 }} label="Años de experiencia" value={f.years} keyboardType="numeric" onChangeText={(t) => setF({ ...f, years: t.replace(/\D/g, '') })} />
      </View>
      <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: -8, marginBottom: 14 }}>
        Recibirás {money((Number(f.rate) || 0) * (1 - COMMISSION))} por visita después de la comisión del {COMMISSION * 100}%.
      </Text>
      <Input label="Horario de disponibilidad" icon="time-outline" value={f.schedule} onChangeText={(t) => setF({ ...f, schedule: t })} />
      <Text style={s.label}>Zona de cobertura</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
        {ZONES.map((z) => <Chip key={z} label={z} active={f.zone === z} onPress={() => setF({ ...f, zone: z })} />)}
      </ScrollView>
      <Text style={s.label}>Servicios que ofreces</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 }}>
        {f.services.map((sv) => (
          <Pressable key={sv} onPress={() => setF({ ...f, services: f.services.filter((x) => x !== sv) })} style={s.svc}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>{sv}</Text>
            <Ionicons name="close" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <Input style={{ flex: 1, marginRight: 8 }} value={newService} onChangeText={setNewService} placeholder="Ej. Instalación de boiler" onSubmitEditing={addService} />
        <Button title="Agregar" small variant="ghost" style={{ height: 50 }} onPress={addService} />
      </View>
      <Card style={{ marginTop: 6 }}>
        <Text style={{ fontWeight: '800', color: colors.text, marginBottom: 6 }}>Documentos de verificación</Text>
        {(p.documents || ['INE (frente y reverso)', 'Comprobante de domicilio']).map((d) => (
          <View key={d} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 3 }}>
            <Ionicons name={p.verified ? 'checkmark-circle' : 'time-outline'} size={16} color={p.verified ? colors.success : colors.warning} />
            <Text style={{ marginLeft: 6, color: colors.textSoft }}>{d}</Text>
          </View>
        ))}
        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 6 }}>Tus documentos se guardan cifrados y solo los revisa el equipo de verificación.</Text>
      </Card>
    </Screen>
  );
}

const PLANS = [
  { id: 'mensual', name: 'Mensual', price: 149, per: '/mes', perks: ['Perfil destacado', 'Primero en búsquedas', 'Insignia Premium'] },
  { id: 'trimestral', name: 'Trimestral', price: 399, per: '/3 meses', perks: ['Todo lo del plan mensual', 'Ahorra 10%', 'Estadísticas de visitas'], best: true },
  { id: 'anual', name: 'Anual', price: 1399, per: '/año', perks: ['Todo lo anterior', 'Ahorra 22%', 'Soporte prioritario'] },
];

export function Premium() {
  const { state, me, actions, showToast } = useStore();
  const nav = useNav();
  const p = state.providers.find((x) => x.id === me.providerId);
  const [plan, setPlan] = useState('trimestral');
  if (p.premium)
    return (
      <Screen title="Plan Premium" back>
        <Card style={{ alignItems: 'center', backgroundColor: colors.accentSoft, borderColor: colors.accent }}>
          <Ionicons name="ribbon" size={44} color={colors.accentDark} />
          <Text style={{ fontWeight: '900', fontSize: 20, color: colors.text, marginTop: 8 }}>¡Eres Premium!</Text>
          <Text style={{ color: colors.textSoft, marginTop: 4, textAlign: 'center' }}>
            Plan {p.premiumPlan || 'mensual'}{p.premiumSince ? ` desde ${p.premiumSince}` : ''}. Tu perfil aparece destacado en las búsquedas.
          </Text>
        </Card>
        <Button title="Cancelar plan" variant="danger" style={{ marginTop: 16 }}
          onPress={() => confirm('Cancelar Premium', 'Tu perfil dejará de aparecer como destacado.', () => actions.cancelPremium(p.id), 'Cancelar plan', true)} />
      </Screen>
    );
  const sel = PLANS.find((x) => x.id === plan);
  return (
    <Screen title="Plan Premium" back footer={
      <Button title={`Contratar ${sel.name} · ${money(sel.price)}`} variant="accent" icon="ribbon"
        onPress={() => confirm('Confirmar plan', `${sel.name}: ${money(sel.price)} ${sel.per}\nSe cobrará a tu método de pago registrado (demo).`, () => {
          actions.buyPremium(p.id, sel.id);
          showToast('¡Ahora eres Premium!', 'Tu perfil ya aparece como destacado.');
          nav.back();
        }, 'Contratar')} />
    }>
      <Text style={{ color: colors.textSoft, marginBottom: 16, lineHeight: 20 }}>
        Los perfiles destacados aparecen primero en los resultados y en la sección "Destacados cerca de ti" de la pantalla de inicio.
      </Text>
      {PLANS.map((pl) => (
        <Pressable key={pl.id} onPress={() => setPlan(pl.id)} style={[s.plan, plan === pl.id && s.planActive]}>
          {pl.best ? <View style={s.best}><Text style={{ fontSize: 11, fontWeight: '900', color: '#fff' }}>MÁS POPULAR</Text></View> : null}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name={plan === pl.id ? 'radio-button-on' : 'radio-button-off'} size={22} color={colors.primary} />
            <Text style={{ flex: 1, marginLeft: 10, fontWeight: '900', fontSize: 17, color: colors.text }}>{pl.name}</Text>
            <Text style={{ fontWeight: '900', fontSize: 18, color: colors.text }}>{money(pl.price)}</Text>
            <Text style={{ color: colors.textSoft, fontSize: 12 }}>{pl.per}</Text>
          </View>
          {pl.perks.map((pk) => (
            <View key={pk} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, marginLeft: 32 }}>
              <Ionicons name="checkmark" size={15} color={colors.success} />
              <Text style={{ marginLeft: 6, color: colors.textSoft }}>{pk}</Text>
            </View>
          ))}
        </Pressable>
      ))}
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 22, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, ...clay(colors.card) },
  bell: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', ...clay(colors.primarySoft, { depth: 0.6 }) },
  dot: { position: 'absolute', top: 2, right: 2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  dotText: { fontSize: 10, fontWeight: '900', color: '#fff' },
  availRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 22, padding: 14, marginTop: 18, ...sunken },
  premiumCard: { flexDirection: 'row', alignItems: 'center', marginTop: 20, ...clay(colors.accentSoft, { tint: colors.accent, strong: 0.22 }) },
  label: { fontWeight: '700', color: colors.text, marginBottom: 8, fontSize: 14 },
  svc: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8, marginRight: 10, marginBottom: 10, ...clay(colors.primarySoft, { depth: 0.45 }) },
  plan: { borderRadius: 30, padding: 18, marginBottom: 16, ...clay(colors.card) },
  planActive: { ...clay(colors.accentSoft, { tint: colors.accent, strong: 0.25 }) },
  best: { position: 'absolute', top: -11, right: 18, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, ...clay(colors.accent, { tint: colors.accent, depth: 0.4, strong: 0.35 }) },
});
