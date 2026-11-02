import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Avatar, Badge, Button, CategoryIcon, Card, Chip, Logo, pastelOf, Empty, InfoRow, Input, ProviderCard, Screen, SectionTitle, Stars, StatusBadge, confirm,
} from '../components';
import { clay, colors, COMMISSION, money, radius, sunken } from '../theme';
import { useNav } from '../nav';
import { ratingOf, useStore } from '../store';
import { CATEGORIES, categoryById, ZONES } from '../data';

const ACTIVE = ['pendiente', 'aceptada', 'reprogramada', 'en_camino', 'en_proceso', 'completada', 'pagada'];

/* ------------------------------ INICIO ------------------------------ */
export function ClientHome() {
  const { state, me, actions } = useStore();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const unread = state.notifications.filter((n) => n.userId === me.id && !n.read).length;
  const visible = state.providers.filter((p) => p.verified && p.active);
  const featured = visible.filter((p) => p.premium).sort((a, b) => a.distance - b.distance);
  const topRated = [...visible].sort((a, b) => ratingOf(b) - ratingOf(a)).slice(0, 4);
  const active = state.requests.filter((r) => r.clientId === me.id && ACTIVE.includes(r.status));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={[s.hero, { paddingTop: insets.top + 14 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Logo height={34} />
          </View>
          <Pressable onPress={() => nav.push('Notifications')} style={s.bell}>
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
            {unread ? <View style={s.dot}><Text style={s.dotText}>{unread > 9 ? '9+' : unread}</Text></View> : null}
          </Pressable>
        </View>
        <Text style={{ color: colors.textSoft, fontSize: 15, marginTop: 20 }}>Hola, {me.name.split(' ')[0]} 👋</Text>
        <Text style={s.heroTitle}>¿Qué servicio necesitas hoy?</Text>
        <Pressable onPress={() => nav.push('Location')} style={s.locChip}>
          <Ionicons name="location" size={15} color={colors.accent} />
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14, marginLeft: 5 }}>
            {state.locationAllowed ? `${state.myZone} · Ciudad piloto` : 'Activar ubicación'}
          </Text>
          <Ionicons name="chevron-down" size={15} color={colors.primary} style={{ marginLeft: 3 }} />
        </Pressable>
        <Pressable onPress={() => nav.setTab('search', { focus: true })} style={s.searchBar}>
          <Ionicons name="search" size={20} color={colors.accent} />
          <Text style={{ color: colors.textMuted, marginLeft: 10, fontSize: 15.5 }}>Plomero, electricista, mecánico…</Text>
        </Pressable>
      </View>

      <View style={{ padding: 18 }}>
        {!state.locationAllowed ? (
          <Card style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }} onPress={() => nav.push('Location')}>
            <View style={s.locIcon}><Ionicons name="navigate" size={20} color={colors.primary} /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: '800', color: colors.text }}>Muestra prestadores cerca de ti</Text>
              <Text style={{ color: colors.textSoft, fontSize: 13, marginTop: 2 }}>Permite el uso de tu ubicación solo para este fin.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Card>
        ) : null}

        {active.length ? (
          <>
            <SectionTitle action="Ver todas" onAction={() => nav.setTab('requests')}>Tus servicios en curso</SectionTitle>
            {active.slice(0, 2).map((r) => {
              const p = state.providers.find((x) => x.id === r.providerId);
              return (
                <Card key={r.id} style={{ marginBottom: 10 }} onPress={() => nav.push('RequestDetail', { id: r.id })}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar name={p ? p.name : '?'} size={42} color={categoryById(p && p.category).color} logo={categoryById(p && p.category).logo} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={{ fontWeight: '700', color: colors.text }}>{r.service}</Text>
                      <Text style={{ color: colors.textSoft, fontSize: 13 }}>{p ? p.name : ''} · {r.date} {r.time}</Text>
                    </View>
                    <StatusBadge status={r.status} />
                  </View>
                </Card>
              );
            })}
          </>
        ) : null}

        <SectionTitle>Categorías</SectionTitle>
        <View style={s.grid}>
          {CATEGORIES.map((c) => (
            <Pressable key={c.id} style={s.catItem} onPress={() => nav.setTab('search', { category: c.id })}>
              <View style={[s.catIcon, clay(pastelOf(c), { tint: c.color, depth: 0.85, strong: 0.24 })]}>
                <CategoryIcon category={c} size={30} />
              </View>
              <Text style={s.catText} numberOfLines={2}>{c.short || c.name}</Text>
            </Pressable>
          ))}
        </View>

        <SectionTitle action="Ver todos" onAction={() => nav.setTab('search')}>Destacados cerca de ti</SectionTitle>
        <View style={{ paddingTop: 8 }}>
          {featured.map((p) => <ProviderCard key={p.id} provider={p} onPress={() => nav.push('ProviderDetail', { id: p.id })} />)}
        </View>

        <SectionTitle>Mejor calificados</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {topRated.map((p) => {
            const c = categoryById(p.category);
            return (
              <Card key={p.id} style={s.mini} onPress={() => nav.push('ProviderDetail', { id: p.id })}>
                <Avatar name={p.name} color={c.color} logo={c.logo} size={44} />
                <Text style={{ fontWeight: '700', marginTop: 8, color: colors.text }} numberOfLines={1}>{p.name}</Text>
                <Text style={{ color: colors.textSoft, fontSize: 12 }}>{c.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                  <Ionicons name="star" size={13} color={colors.accent} />
                  <Text style={{ marginLeft: 4, fontWeight: '700', color: colors.text }}>{ratingOf(p).toFixed(1)}</Text>
                </View>
              </Card>
            );
          })}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

/* ------------------------------ UBICACIÓN ------------------------------ */
export function LocationScreen() {
  const { state, actions } = useStore();
  const nav = useNav();
  const [zone, setZone] = useState(state.myZone);
  return (
    <Screen title="Tu ubicación" back footer={
      <>
        <Button title={state.locationAllowed ? 'Guardar zona' : 'Permitir y guardar'} icon="navigate-outline"
          onPress={() => { actions.setLocation(true, zone); nav.back(); }} />
        {state.locationAllowed ? (
          <Button title="Desactivar ubicación" variant="danger" style={{ marginTop: 8 }} onPress={() => { actions.setLocation(false); nav.back(); }} />
        ) : null}
      </>
    }>
      <Card style={{ marginBottom: 18 }}>
        <View style={{ flexDirection: 'row' }}>
          <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
          <Text style={{ flex: 1, marginLeft: 10, color: colors.text, lineHeight: 20 }}>
            ServiCerca usa tu ubicación únicamente para mostrarte prestadores cercanos y para el servicio que solicites.
            Puedes desactivarla en cualquier momento.
          </Text>
        </View>
      </Card>
      <Text style={{ fontWeight: '700', marginBottom: 10, color: colors.text }}>Selecciona tu zona (ciudad piloto)</Text>
      {ZONES.map((z) => (
        <Pressable key={z} onPress={() => setZone(z)} style={[s.option, zone === z && s.optionActive]}>
          <Ionicons name={zone === z ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.primary} />
          <Text style={{ marginLeft: 10, fontWeight: '600', color: colors.text }}>{z}</Text>
        </Pressable>
      ))}
    </Screen>
  );
}

/* ------------------------------ BUSCAR ------------------------------ */
const SORTS = [
  ['relevancia', 'Recomendados'],
  ['distancia', 'Más cerca'],
  ['rating', 'Mejor calificados'],
  ['precio', 'Menor precio'],
];

export function SearchScreen() {
  const { state } = useStore();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(null);
  const [sort, setSort] = useState('relevancia');
  const [maxKm, setMaxKm] = useState(null);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (nav.tabParams.category) setCat(nav.tabParams.category);
  }, [nav.tabParams._ts]);

  const results = useMemo(() => {
    const text = q.trim().toLowerCase();
    let list = state.providers.filter((p) => p.verified && p.active);
    if (cat) list = list.filter((p) => p.category === cat);
    if (text)
      list = list.filter((p) =>
        [p.name, p.description, categoryById(p.category).name, ...(p.services || [])].join(' ').toLowerCase().includes(text)
      );
    if (maxKm) list = list.filter((p) => p.distance <= maxKm);
    if (minRating) list = list.filter((p) => ratingOf(p) >= minRating);
    const by = {
      relevancia: (a, b) => (b.premium - a.premium) || (ratingOf(b) - b.distance * 0.2) - (ratingOf(a) - a.distance * 0.2),
      distancia: (a, b) => a.distance - b.distance,
      rating: (a, b) => ratingOf(b) - ratingOf(a),
      precio: (a, b) => a.rate - b.rate,
    }[sort];
    return [...list].sort(by);
  }, [state.providers, q, cat, sort, maxKm, minRating]);

  const filtersOn = (maxKm ? 1 : 0) + (minRating ? 1 : 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[s.searchHeader, { paddingTop: insets.top + 10 }]}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 10 }}>Buscar servicios</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[s.searchInput, { flex: 1 }]}>
            <Ionicons name="search" size={19} color={colors.textMuted} />
            <TextInput value={q} onChangeText={setQ} placeholder="¿Qué necesitas?" placeholderTextColor={colors.textMuted}
              style={{ flex: 1, marginLeft: 8, fontSize: 15, color: colors.text, minHeight: 44 }} autoFocus={!!nav.tabParams.focus} />
            {q ? <Pressable onPress={() => setQ('')}><Ionicons name="close-circle" size={18} color={colors.textMuted} /></Pressable> : null}
          </View>
          <Pressable onPress={() => setShowFilters(!showFilters)} style={[s.filterBtn, filtersOn && { backgroundColor: colors.primary }]}>
            <Ionicons name="options-outline" size={22} color={filtersOn ? '#fff' : colors.primary} />
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          <Chip label="Todas" active={!cat} onPress={() => setCat(null)} />
          {CATEGORIES.map((c) => <Chip key={c.id} label={c.name} icon={c.icon} logo={c.logo} active={cat === c.id} onPress={() => setCat(cat === c.id ? null : c.id)} />)}
        </ScrollView>
        {showFilters ? (
          <View style={{ marginTop: 12 }}>
            <Text style={s.filterLabel}>Ordenar por</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {SORTS.map(([k, l]) => <Chip key={k} label={l} active={sort === k} onPress={() => setSort(k)} />)}
            </ScrollView>
            <Text style={s.filterLabel}>Distancia máxima</Text>
            <View style={{ flexDirection: 'row' }}>
              {[[null, 'Cualquiera'], [2, '2 km'], [3, '3 km'], [5, '5 km']].map(([v, l]) => (
                <Chip key={l} label={l} active={maxKm === v} onPress={() => setMaxKm(v)} />
              ))}
            </View>
            <Text style={s.filterLabel}>Calificación mínima</Text>
            <View style={{ flexDirection: 'row' }}>
              {[[0, 'Todas'], [4, '4+ ★'], [4.5, '4.5+ ★']].map(([v, l]) => (
                <Chip key={l} label={l} active={minRating === v} onPress={() => setMinRating(v)} />
              ))}
            </View>
          </View>
        ) : null}
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <Text style={{ color: colors.textSoft, marginBottom: 12 }}>
          {results.length} prestador{results.length === 1 ? '' : 'es'} verificado{results.length === 1 ? '' : 's'}
          {!state.locationAllowed ? ' · activa tu ubicación para ver distancias exactas' : ''}
        </Text>
        <View style={{ paddingTop: 6 }}>
          {results.map((p) => <ProviderCard key={p.id} provider={p} onPress={() => nav.push('ProviderDetail', { id: p.id })} />)}
        </View>
        {!results.length ? <Empty icon="search-outline" title="Sin resultados" text="Prueba con otra categoría o quita algunos filtros." /> : null}
      </ScrollView>
    </View>
  );
}

/* ------------------------------ PERFIL DEL PRESTADOR ------------------------------ */
export function ProviderDetail({ params }) {
  const { state, me } = useStore();
  const nav = useNav();
  const p = state.providers.find((x) => x.id === params.id);
  if (!p) return <Screen title="Prestador" back><Empty title="Prestador no disponible" /></Screen>;
  const c = categoryById(p.category);
  const rating = ratingOf(p);
  const isClient = me.role === 'cliente';
  const dist = [5, 4, 3, 2, 1].map((n) => p.reviews.filter((r) => r.rating === n).length);

  return (
    <Screen title={c.name} back footer={isClient ? (
      <View style={{ flexDirection: 'row' }}>
        <Button title="" icon="chatbubble-ellipses-outline" variant="ghost" style={{ width: 56, marginRight: 10, paddingHorizontal: 0 }}
          onPress={() => nav.push('Chat', { clientId: me.id, providerId: p.id })} />
        <Button title={`Solicitar servicio · $${p.rate}`} icon="calendar-outline" style={{ flex: 1 }}
          onPress={() => nav.push('RequestForm', { providerId: p.id })} />
      </View>
    ) : null}>
      <Card style={{ alignItems: 'center' }}>
        <Avatar name={p.name} color={c.color} logo={c.logo} size={78} />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <Text style={{ fontSize: 21, fontWeight: '800', color: colors.text, textAlign: 'center' }}>{p.name}</Text>
          {p.verified ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={{ marginLeft: 6 }} /> : null}
        </View>
        <Text style={{ color: colors.textSoft, marginTop: 2 }}>{c.role || c.name} · {p.zone}</Text>
        <View style={{ flexDirection: 'row', marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {p.verified ? <View style={{ marginRight: 6 }}><Badge label="Verificado" icon="shield-checkmark" /></View> : null}
          {p.premium ? <Badge label="Destacado" icon="ribbon" color={colors.accentDark} bg={colors.accentSoft} /> : null}
        </View>
        <View style={s.statsRow}>
          <View style={s.stat}><Text style={s.statNum}>{rating ? rating.toFixed(1) : '—'}</Text><Text style={s.statLbl}>Calificación</Text></View>
          <View style={s.stat}><Text style={s.statNum}>{p.reviews.length}</Text><Text style={s.statLbl}>Reseñas</Text></View>
          <View style={s.stat}><Text style={s.statNum}>{p.years}</Text><Text style={s.statLbl}>Años exp.</Text></View>
          <View style={s.stat}><Text style={s.statNum}>{p.distance.toFixed(1)}</Text><Text style={s.statLbl}>km</Text></View>
        </View>
      </Card>

      <SectionTitle>Acerca de</SectionTitle>
      <Card><Text style={{ color: colors.text, lineHeight: 21 }}>{p.description}</Text></Card>

      <SectionTitle>Servicios</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {(p.services.length ? p.services : ['Servicio general']).map((sv) => (
          <View key={sv} style={s.serviceTag}><Ionicons name="checkmark" size={14} color={colors.success} /><Text style={{ marginLeft: 4, color: colors.text }}>{sv}</Text></View>
        ))}
      </View>

      <SectionTitle>Información</SectionTitle>
      <Card style={{ paddingVertical: 4 }}>
        <InfoRow icon="cash-outline" label="Tarifa por visita" value={money(p.rate)} />
        <InfoRow icon="time-outline" label="Disponibilidad" value={p.schedule} />
        <InfoRow icon="map-outline" label="Zona de cobertura" value={p.zone} />
        <View style={[s.infoLast]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textSoft} />
          <Text style={{ flex: 1, marginLeft: 8, color: colors.textSoft, fontSize: 12 }}>
            El precio final se confirma antes de solicitar. Materiales no incluidos.
          </Text>
        </View>
      </Card>

      <SectionTitle>Reseñas ({p.reviews.length})</SectionTitle>
      {p.reviews.length ? (
        <Card style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ alignItems: 'center', marginRight: 18 }}>
              <Text style={{ fontSize: 36, fontWeight: '900', color: colors.text }}>{rating.toFixed(1)}</Text>
              <Stars value={rating} size={13} />
            </View>
            <View style={{ flex: 1 }}>
              {dist.map((n, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 2 }}>
                  <Text style={{ width: 14, color: colors.textSoft, fontSize: 12 }}>{5 - i}</Text>
                  <View style={s.barBg}><View style={[s.barFill, { width: `${(n / p.reviews.length) * 100}%` }]} /></View>
                </View>
              ))}
            </View>
          </View>
        </Card>
      ) : <Card><Text style={{ color: colors.textSoft }}>Aún no tiene reseñas.</Text></Card>}
      {p.reviews.map((r, i) => (
        <Card key={i} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Avatar name={r.author} size={32} color={colors.textSoft} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontWeight: '700', color: colors.text }}>{r.author}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{r.date}</Text>
            </View>
            <Stars value={r.rating} size={12} />
          </View>
          {r.text ? <Text style={{ color: colors.text, lineHeight: 20 }}>{r.text}</Text> : null}
        </Card>
      ))}

      {isClient ? (
        <Pressable onPress={() => nav.push('Report', { providerId: p.id })} style={{ alignItems: 'center', marginTop: 10, padding: 10 }}>
          <Text style={{ color: colors.danger, fontWeight: '600' }}>Reportar a este prestador</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

/* ------------------------------ SOLICITAR SERVICIO ------------------------------ */
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const nextDays = (n = 7) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return { iso: d.toISOString().slice(0, 10), label: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : DAYS[d.getDay()], day: d.getDate() };
  });
export const TIMES = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '15:00', '16:00', '17:00', '18:00'];

export function DateTimePicker({ date, time, onDate, onTime }) {
  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {nextDays(10).map((d) => (
          <Pressable key={d.iso} onPress={() => onDate(d.iso)} style={[s.day, date === d.iso && s.dayActive]}>
            <Text style={[s.dayLbl, date === d.iso && { color: '#FFE8D5' }]}>{d.label}</Text>
            <Text style={[s.dayNum, date === d.iso && { color: '#fff' }]}>{d.day}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {TIMES.map((t) => (
          <Pressable key={t} onPress={() => onTime(t)} style={[s.time, time === t && s.dayActive]}>
            <Text style={{ fontWeight: '700', color: time === t ? '#fff' : colors.text }}>{t}</Text>
          </Pressable>
        ))}
      </View>
    </>
  );
}

export function RequestForm({ params }) {
  const { state, me, actions } = useStore();
  const nav = useNav();
  const p = state.providers.find((x) => x.id === params.providerId);
  const [service, setService] = useState(p.services[0] || 'Servicio general');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(nextDays()[1].iso);
  const [time, setTime] = useState('10:00');
  const [address, setAddress] = useState(me.address || '');
  const [err, setErr] = useState('');
  const [sending, setSending] = useState(false);

  const submit = () => {
    if (description.trim().length < 5) return setErr('Describe brevemente el trabajo (mínimo 5 caracteres).');
    if (address.trim().length < 5) return setErr('Indica la dirección del trabajo.');
    confirm('Confirmar solicitud', `${service} con ${p.name}\n${date} a las ${time}\nPrecio por visita: ${money(p.rate)}`, async () => {
      setSending(true);
      const id = await actions.createRequest({ providerId: p.id, service, description: description.trim(), date, time, address: address.trim() });
      setSending(false);
      if (!id) return;
      nav.setTab('requests');
      nav.push('RequestDetail', { id, fresh: true });
    }, 'Enviar');
  };

  return (
    <Screen title="Solicitar servicio" subtitle={p.name} back footer={
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={{ color: colors.textSoft }}>Precio por visita</Text>
          <Text style={{ fontWeight: '800', color: colors.text, fontSize: 16 }}>{money(p.rate)}</Text>
        </View>
        <Button title="Enviar solicitud" icon="send-outline" loading={sending} onPress={submit} />
      </View>
    }>
      <Text style={s.step}>1. ¿Qué necesitas?</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 }}>
        {(p.services.length ? p.services : ['Servicio general']).map((sv) => (
          <View key={sv} style={{ marginBottom: 8 }}><Chip label={sv} active={service === sv} onPress={() => setService(sv)} /></View>
        ))}
      </View>
      <Text style={s.step}>2. Describe el trabajo</Text>
      <Input value={description} onChangeText={(t) => { setDescription(t); setErr(''); }} multiline
        placeholder="Ej. Hay una fuga debajo del lavabo de la cocina desde ayer." />
      <Text style={s.step}>3. Fecha y hora</Text>
      <DateTimePicker date={date} time={time} onDate={setDate} onTime={setTime} />
      <Text style={[s.step, { marginTop: 10 }]}>4. Dirección del trabajo</Text>
      <Input icon="home-outline" value={address} onChangeText={(t) => { setAddress(t); setErr(''); }} placeholder="Calle, número y colonia" />
      {err ? <Text style={{ color: colors.danger, fontWeight: '600' }}>{err}</Text> : null}
      <View style={s.note}>
        <Ionicons name="lock-closed-outline" size={16} color={colors.primary} />
        <Text style={{ flex: 1, marginLeft: 8, color: colors.textSoft, fontSize: 12, lineHeight: 17 }}>
          Al enviar aceptas los términos del servicio. El pago se realiza en la app al terminar el trabajo, mediante una pasarela segura.
        </Text>
      </View>
    </Screen>
  );
}

/* ------------------------------ MIS SOLICITUDES ------------------------------ */
export function ClientRequests() {
  const { state, me } = useStore();
  const nav = useNav();
  const [tab, setTab] = useState('activas');
  const mine = state.requests.filter((r) => r.clientId === me.id);
  const list = tab === 'activas' ? mine.filter((r) => ACTIVE.includes(r.status)) : mine.filter((r) => !ACTIVE.includes(r.status));
  return (
    <Screen title="Mis solicitudes" large>
      <View style={s.segment}>
        {[['activas', 'En curso'], ['historial', 'Historial']].map(([k, l]) => (
          <Pressable key={k} onPress={() => setTab(k)} style={[s.segBtn, tab === k && s.segActive]}>
            <Text style={[s.segText, tab === k && { color: colors.primary }]}>{l}</Text>
          </Pressable>
        ))}
      </View>
      {list.map((r) => <RequestCard key={r.id} req={r} onPress={() => nav.push('RequestDetail', { id: r.id })} />)}
      {!list.length ? (
        <Empty icon="calendar-outline" title={tab === 'activas' ? 'No tienes servicios en curso' : 'Sin historial todavía'}
          text="Busca un prestador y solicita tu primer servicio."
          action={<Button title="Buscar servicios" icon="search" onPress={() => nav.setTab('search')} />} />
      ) : null}
    </Screen>
  );
}

export function RequestCard({ req, onPress, showClient }) {
  const { state } = useStore();
  const p = state.providers.find((x) => x.id === req.providerId);
  const c = categoryById(p && p.category);
  return (
    <Card style={{ marginBottom: 12 }} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Avatar name={showClient ? req.clientName : p ? p.name : '?'} size={44} color={showClient ? colors.primary : c.color} logo={showClient ? null : c.logo} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontWeight: '800', color: colors.text }} numberOfLines={1}>{req.service}</Text>
          <Text style={{ color: colors.textSoft, fontSize: 13, marginTop: 2 }} numberOfLines={1}>
            {showClient ? req.clientName : p ? p.name : ''}
          </Text>
        </View>
        <StatusBadge status={req.status} />
      </View>
      <View style={s.reqMeta}>
        <Ionicons name="calendar-outline" size={14} color={colors.textSoft} />
        <Text style={s.reqMetaText}>{req.date} · {req.time}</Text>
        <Ionicons name="cash-outline" size={14} color={colors.textSoft} style={{ marginLeft: 14 }} />
        <Text style={s.reqMetaText}>{money(req.price)}</Text>
      </View>
    </Card>
  );
}

/* ------------------------------ PAGO ------------------------------ */
export function Payment({ params }) {
  const { state, actions, showToast } = useStore();
  const nav = useNav();
  const req = state.requests.find((r) => r.id === params.id);
  const p = state.providers.find((x) => x.id === req.providerId);
  const [method, setMethod] = useState('card');
  const [card, setCard] = useState({ number: '', exp: '', cvv: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const commission = Math.round(req.price * COMMISSION * 100) / 100;

  const pay = () => {
    let label = 'Transferencia SPEI';
    if (method === 'cash') label = 'Efectivo';
    if (method === 'card') {
      const digits = card.number.replace(/\D/g, '');
      if (digits.length < 15 || !/^\d{2}\/\d{2}$/.test(card.exp) || card.cvv.length < 3 || card.name.trim().length < 3)
        return setErr('Revisa los datos de la tarjeta.');
      label = `Tarjeta •••• ${digits.slice(-4)}`;
    }
    setLoading(true);
    setTimeout(async () => {
      const r = await actions.payRequest(req.id, label);
      setLoading(false);
      if (!r.ok) return;
      if (r.pending) {
        showToast('Pago en efectivo registrado', `Entrega ${money(req.price)} al prestador. Podrás calificar cuando confirme que lo recibió.`);
        nav.back();
      } else nav.replace('Rate', { id: req.id, paid: true, folio: r.folio });
    }, method === 'cash' ? 300 : 1200);
  };

  const fmtCard = (t) => t.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExp = (t) => { const d = t.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };

  return (
    <Screen title="Pagar servicio" back footer={
      <Button title={method === 'cash' ? `Pagaré ${money(req.price)} en efectivo` : `Pagar ${money(req.price)}`}
        icon={method === 'cash' ? 'cash-outline' : 'lock-closed'} loading={loading} onPress={pay} />
    }>
      <Card>
        <Text style={{ fontWeight: '800', fontSize: 16, color: colors.text }}>{req.service}</Text>
        <Text style={{ color: colors.textSoft, marginTop: 2 }}>{p.name} · {req.date}</Text>
        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 12 }} />
        <View style={s.payRow}><Text style={s.payLbl}>Servicio</Text><Text style={s.payVal}>{money(req.price)}</Text></View>
        <View style={s.payRow}><Text style={s.payLbl}>Cargo por uso de la app</Text><Text style={s.payVal}>{money(0)}</Text></View>
        <View style={[s.payRow, { marginTop: 6 }]}><Text style={[s.payLbl, { fontWeight: '800', color: colors.text }]}>Total</Text><Text style={[s.payVal, { fontSize: 18 }]}>{money(req.price)}</Text></View>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>
          ServiCerca retiene una comisión de {money(commission)} ({COMMISSION * 100}%) al prestador. Recibirás tu comprobante fiscal (CFDI) por correo.
        </Text>
      </Card>

      <SectionTitle>Método de pago</SectionTitle>
      {[['card', 'card-outline', 'Tarjeta de crédito o débito'], ['cash', 'cash-outline', 'Efectivo al prestador'], ['spei', 'swap-horizontal-outline', 'Transferencia SPEI']].map(([k, icon, l]) => (
        <Pressable key={k} onPress={() => { setMethod(k); setErr(''); }} style={[s.option, method === k && s.optionActive]}>
          <Ionicons name={icon} size={20} color={colors.primary} />
          <Text style={{ flex: 1, marginLeft: 10, fontWeight: '600', color: colors.text }}>{l}</Text>
          <Ionicons name={method === k ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.primary} />
        </Pressable>
      ))}

      {method === 'card' ? (
        <View style={{ marginTop: 8 }}>
          <Input label="Número de tarjeta" icon="card-outline" value={card.number} keyboardType="numeric" placeholder="4242 4242 4242 4242"
            onChangeText={(t) => { setCard({ ...card, number: fmtCard(t) }); setErr(''); }} />
          <View style={{ flexDirection: 'row' }}>
            <Input style={{ flex: 1, marginRight: 10 }} label="Vencimiento" value={card.exp} keyboardType="numeric" placeholder="MM/AA"
              onChangeText={(t) => setCard({ ...card, exp: fmtExp(t) })} />
            <Input style={{ flex: 1 }} label="CVV" value={card.cvv} keyboardType="numeric" placeholder="123" secureTextEntry
              onChangeText={(t) => setCard({ ...card, cvv: t.replace(/\D/g, '').slice(0, 4) })} />
          </View>
          <Input label="Nombre en la tarjeta" value={card.name} onChangeText={(t) => setCard({ ...card, name: t })} placeholder="Como aparece en la tarjeta" />
        </View>
      ) : method === 'cash' ? (
        <Card style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="cash" size={22} color={colors.success} />
            <Text style={{ marginLeft: 8, fontWeight: '800', color: colors.text, fontSize: 16 }}>Pago en efectivo</Text>
          </View>
          <Text style={{ color: colors.textSoft, lineHeight: 21 }}>
            Entrega {money(req.price)} directamente a {p.name} al terminar el trabajo. Cuando confirme que lo recibió, el servicio quedará pagado y podrás calificarlo.
          </Text>
          <Text style={{ color: colors.textMuted, lineHeight: 19, marginTop: 8, fontSize: 12 }}>Te recomendamos pagar con el importe exacto.</Text>
        </Card>
      ) : (
        <Card style={{ marginTop: 8 }}>
          <Text style={{ color: colors.text, lineHeight: 20 }}>Se generará una CLABE de referencia única. El pago se confirma automáticamente al recibir la transferencia.</Text>
        </Card>
      )}
      {err ? <Text style={{ color: colors.danger, fontWeight: '600' }}>{err}</Text> : null}
      <View style={s.note}>
        <Ionicons name="shield-checkmark-outline" size={16} color={colors.success} />
        <Text style={{ flex: 1, marginLeft: 8, color: colors.textSoft, fontSize: 12, lineHeight: 17 }}>
          Modo de demostración: no se realiza ningún cobro real. En producción el cobro lo procesa una pasarela certificada PCI DSS y ServiCerca no almacena los datos de tu tarjeta.
        </Text>
      </View>
    </Screen>
  );
}

/* ------------------------------ CALIFICAR ------------------------------ */
const CLIENT_TAGS = ['Puntual', 'Amable', 'Pagó a tiempo', 'Instrucciones claras', 'Respetuoso', 'Buena comunicación'];
const TAGS = ['Puntual', 'Amable', 'Buen precio', 'Trabajo limpio', 'Profesional', 'Rápido'];
export function Rate({ params }) {
  const { state, actions, showToast } = useStore();
  const nav = useNav();
  const req = state.requests.find((r) => r.id === params.id);
  const p = state.providers.find((x) => x.id === req.providerId);
  const forClient = params.target === 'client'; // el prestador califica al cliente
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState('');
  const tagList = forClient ? CLIENT_TAGS : TAGS;
  const send = async () => {
    const text = [tags.join(', '), comment.trim()].filter(Boolean).join('. ');
    const r = forClient ? await actions.rateClient(req.id, rating, text) : await actions.rateRequest(req.id, rating, text);
    if (!r.ok) return;
    showToast('¡Gracias por tu calificación!', forClient ? 'Ayuda a otros prestadores a conocer a sus clientes.' : 'Tu opinión ayuda a otros clientes.');
    nav.back();
  };
  return (
    <Screen title={forClient ? 'Califica al cliente' : 'Califica el servicio'} back footer={<Button title="Enviar calificación" icon="star" onPress={send} />}>
      {params.paid ? (
        <View style={[s.note, { backgroundColor: colors.successSoft, marginTop: 0, marginBottom: 16 }]}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={{ flex: 1, marginLeft: 8, color: colors.text, fontWeight: '600' }}>Pago realizado con éxito. Folio {params.folio || (req.payment && req.payment.folio)}</Text>
        </View>
      ) : null}
      <Card style={{ alignItems: 'center' }}>
        {forClient ? (
          <Avatar name={req.clientName} size={70} color={colors.primary} />
        ) : (
          <Avatar name={p.name} size={70} color={categoryById(p.category).color} logo={categoryById(p.category).logo} />
        )}
        <Text style={{ fontWeight: '800', fontSize: 18, marginTop: 10, color: colors.text }}>{forClient ? req.clientName : p.name}</Text>
        <Text style={{ color: colors.textSoft }}>{forClient ? `Cliente · ${req.service}` : req.service}</Text>
        <View style={{ marginTop: 16 }}><Stars value={rating} size={38} onChange={setRating} /></View>
        <Text style={{ marginTop: 8, color: colors.textSoft, fontWeight: '600' }}>
          {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', '¡Excelente!'][rating]}
        </Text>
      </Card>
      <SectionTitle>¿Qué destacarías?</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {tagList.map((t) => (
          <View key={t} style={{ marginBottom: 8 }}>
            <Chip label={t} active={tags.includes(t)} onPress={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])} />
          </View>
        ))}
      </View>
      <Input label="Comentario (opcional)" value={comment} onChangeText={setComment} multiline placeholder={forClient ? '¿Cómo fue trabajar con este cliente?' : 'Cuéntanos cómo fue el servicio'} style={{ marginTop: 8 }} />
    </Screen>
  );
}

/* ------------------------------ REPORTAR ------------------------------ */
const REASONS = ['Impuntualidad', 'Cobro distinto al acordado', 'Mala calidad del trabajo', 'Comportamiento inapropiado', 'Posible fraude', 'Otro'];
export function Report({ params }) {
  const { state, actions, showToast } = useStore();
  const nav = useNav();
  const p = state.providers.find((x) => x.id === params.providerId);
  const [reason, setReason] = useState(null);
  const [detail, setDetail] = useState('');
  return (
    <Screen title="Reportar prestador" subtitle={p.name} back footer={
      <Button title="Enviar reporte" variant="primary" icon="flag-outline" disabled={!reason}
        onPress={() => { actions.reportProvider(p.id, reason, detail.trim()); showToast('Reporte enviado', 'Nuestro equipo lo revisará en menos de 48 h.'); nav.back(); }} />
    }>
      <Text style={{ color: colors.textSoft, marginBottom: 12 }}>Tu reporte es confidencial y será revisado por el equipo de ServiCerca.</Text>
      {REASONS.map((r) => (
        <Pressable key={r} onPress={() => setReason(r)} style={[s.option, reason === r && s.optionActive]}>
          <Ionicons name={reason === r ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.primary} />
          <Text style={{ marginLeft: 10, fontWeight: '600', color: colors.text }}>{r}</Text>
        </Pressable>
      ))}
      <Input label="Detalles" value={detail} onChangeText={setDetail} multiline placeholder="Describe lo que sucedió" style={{ marginTop: 8 }} />
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, ...clay(colors.card) },
  heroTitle: { color: colors.text, fontSize: 25, fontWeight: '800', marginTop: 2, letterSpacing: -0.4 },
  locChip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, marginTop: 12, marginBottom: 18, ...clay(colors.primarySoft, { depth: 0.5 }) },
  searchBar: { borderRadius: 22, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, height: 56, ...sunken },
  bell: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', ...clay(colors.primarySoft, { depth: 0.6 }) },
  dot: { position: 'absolute', top: 2, right: 2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  dotText: { fontSize: 10, fontWeight: '900', color: '#fff' },
  locIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', ...clay(colors.primarySoft, { depth: 0.5 }) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4, marginBottom: 8 },
  catItem: { width: '33.33%', alignItems: 'center', paddingHorizontal: 4, marginBottom: 18 },
  catIcon: { width: 78, height: 78, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  catText: { fontSize: 13, fontWeight: '700', color: colors.text, textAlign: 'center', marginTop: 10 },
  mini: { width: 150, marginRight: 14, marginBottom: 14, marginTop: 4 },
  searchHeader: { paddingHorizontal: 20, paddingBottom: 14, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, ...clay(colors.card) },
  searchInput: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 14, ...sunken },
  filterBtn: { width: 50, height: 50, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginLeft: 10, ...clay(colors.primarySoft, { depth: 0.6 }) },
  filterLabel: { fontWeight: '700', color: colors.textSoft, fontSize: 12, marginBottom: 6, marginTop: 8, textTransform: 'uppercase' },
  statsRow: { flexDirection: 'row', marginTop: 16, alignSelf: 'stretch', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '900', color: colors.text },
  statLbl: { fontSize: 11, color: colors.textSoft, marginTop: 2 },
  serviceTag: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, marginRight: 10, marginBottom: 10, ...clay(colors.card, { depth: 0.45 }) },
  infoLast: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  barBg: { flex: 1, height: 9, borderRadius: 5, marginLeft: 6, overflow: 'hidden', ...sunken },
  barFill: { height: 9, backgroundColor: colors.accent, borderRadius: 5 },
  step: { fontWeight: '800', color: colors.text, marginBottom: 10, fontSize: 15 },
  day: { width: 64, paddingVertical: 11, borderRadius: 20, alignItems: 'center', marginRight: 10, marginVertical: 6, ...clay(colors.card, { depth: 0.55 }) },
  dayActive: { ...clay(colors.accent, { tint: colors.accent, depth: 0.6, strong: 0.35 }) },
  dayLbl: { fontSize: 12, color: colors.textSoft, fontWeight: '600' },
  dayNum: { fontSize: 20, fontWeight: '900', color: colors.text, marginTop: 2 },
  time: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 16, marginRight: 10, marginBottom: 12, ...clay(colors.card, { depth: 0.45 }) },
  note: { flexDirection: 'row', padding: 14, borderRadius: 20, marginTop: 16, ...clay(colors.primarySoft, { depth: 0.5, strong: 0.08 }) },
  segment: { flexDirection: 'row', borderRadius: 22, padding: 5, marginBottom: 18, ...sunken },
  segBtn: { flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: 18 },
  segActive: { ...clay(colors.card, { depth: 0.5 }) },
  segText: { fontWeight: '700', color: colors.textSoft },
  reqMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEF2F8' },
  reqMetaText: { marginLeft: 5, color: colors.textSoft, fontSize: 13 },
  option: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 22, marginBottom: 12, ...clay(colors.card, { depth: 0.6 }) },
  optionActive: { ...clay(colors.accentSoft, { tint: colors.accent, depth: 0.6, strong: 0.22 }) },
  payRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 },
  payLbl: { color: colors.textSoft },
  payVal: { fontWeight: '800', color: colors.text },
});

export const sharedStyles = s;
