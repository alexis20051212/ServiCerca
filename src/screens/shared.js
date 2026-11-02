import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Avatar, Badge, Button, Card, Empty, Header, InfoRow, Input, ListItem, Screen, SectionTitle, Stars, StatusBadge, confirm,
} from '../components';
import { clay, colors, COMMISSION, money, radius, STATUS, STATUS_FLOW, sunken } from '../theme';
import { useNav } from '../nav';
import { convKey, ratingOf, useStore } from '../store';
import { categoryById } from '../data';
import { DateTimePicker } from './client';

/* ------------------------------ DETALLE DE SOLICITUD ------------------------------ */
export function RequestDetail({ params }) {
  const { state, me, actions } = useStore();
  const nav = useNav();
  const req = state.requests.find((r) => r.id === params.id);
  const [resch, setResch] = useState(false);
  const [newDate, setNewDate] = useState(null);
  const [newTime, setNewTime] = useState(null);
  if (!req) return <Screen title="Solicitud" back><Empty title="Solicitud no encontrada" /></Screen>;
  const p = state.providers.find((x) => x.id === req.providerId);
  const isProvider = me.role === 'prestador';
  const isClient = me.role === 'cliente';
  const st = STATUS[req.status];
  const stepIdx = STATUS_FLOW.indexOf(req.status);
  const commission = Math.round(req.price * COMMISSION * 100) / 100;

  const cashPending = !!(req.payment && req.payment.pending);
  const client = state.users.find((u) => u.id === req.clientId);
  let footer = null;
  if (isClient) {
    if (req.status === 'completada' && cashPending)
      footer = (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
          <Ionicons name="hourglass-outline" size={20} color={colors.warning} />
          <Text style={{ flex: 1, marginLeft: 10, color: colors.text, lineHeight: 20 }}>
            Entrega <Text style={{ fontWeight: '800' }}>{money(req.price)}</Text> en efectivo a {p.name}. Podrás calificar cuando confirme que lo recibió.
          </Text>
        </View>
      );
    else if (req.status === 'completada')
      footer = <Button title={`Pagar ${money(req.price)}`} icon="card-outline" onPress={() => nav.push('Payment', { id: req.id })} />;
    else if (req.status === 'pagada')
      footer = <Button title="Calificar servicio" icon="star-outline" variant="accent" onPress={() => nav.push('Rate', { id: req.id })} />;
    else if (req.status === 'reprogramada')
      footer = (
        <View style={{ flexDirection: 'row' }}>
          <Button title="Cancelar" variant="danger" style={{ flex: 1, marginRight: 8 }} onPress={() => actions.cancelRequest(req.id)} />
          <Button title="Aceptar fecha" icon="checkmark" style={{ flex: 1.4 }} onPress={() => actions.acceptReschedule(req.id)} />
        </View>
      );
    else if (['pendiente', 'aceptada'].includes(req.status))
      footer = (
        <Button title="Cancelar solicitud" variant="danger" icon="close-outline"
          onPress={() => confirm('Cancelar solicitud', '¿Seguro que deseas cancelar este servicio?', () => actions.cancelRequest(req.id), 'Sí, cancelar', true)} />
      );
  }
  if (isProvider) {
    if (req.status === 'pendiente' && !resch)
      footer = (
        <View>
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <Button title="Rechazar" variant="danger" style={{ flex: 1, marginRight: 8 }}
              onPress={() => confirm('Rechazar solicitud', 'El cliente será notificado.', () => actions.providerUpdate(req.id, 'rechazada'), 'Rechazar', true)} />
            <Button title="Reprogramar" variant="ghost" style={{ flex: 1 }} onPress={() => setResch(true)} />
          </View>
          <Button title="Aceptar solicitud" icon="checkmark-circle-outline" variant="success" onPress={() => actions.providerUpdate(req.id, 'aceptada')} />
        </View>
      );
    else if (resch)
      footer = (
        <View style={{ flexDirection: 'row' }}>
          <Button title="Volver" variant="ghost" style={{ flex: 1, marginRight: 8 }} onPress={() => setResch(false)} />
          <Button title="Proponer fecha" style={{ flex: 1.5 }} disabled={!newDate || !newTime}
            onPress={() => { actions.providerUpdate(req.id, 'reprogramada', { date: newDate, time: newTime }); setResch(false); }} />
        </View>
      );
    else if (req.status === 'aceptada')
      footer = <Button title="Voy en camino" icon="car-outline" onPress={() => actions.providerUpdate(req.id, 'en_camino')} />;
    else if (req.status === 'en_camino')
      footer = <Button title="Iniciar trabajo" icon="construct-outline" onPress={() => actions.providerUpdate(req.id, 'en_proceso')} />;
    else if (req.status === 'en_proceso')
      footer = <Button title="Marcar como terminado" icon="checkmark-done-outline" variant="success" onPress={() => actions.providerUpdate(req.id, 'completada')} />;
    else if (req.status === 'completada' && cashPending)
      footer = (
        <Button title={`Confirmar que recibí ${money(req.price)}`} icon="cash-outline" variant="success"
          onPress={() => confirm('Confirmar pago en efectivo', `¿Recibiste ${money(req.price)} de ${req.clientName}?`, () => actions.confirmCash(req.id), 'Sí, lo recibí')} />
      );
    else if (['pagada', 'calificada'].includes(req.status) && !req.providerRating)
      footer = <Button title="Calificar al cliente" icon="star-outline" variant="accent" onPress={() => nav.push('Rate', { id: req.id, target: 'client' })} />;
  }

  const canChat = !['cancelada', 'rechazada'].includes(req.status);

  return (
    <Screen title="Detalle del servicio" subtitle={`Folio ${req.id.slice(-6).toUpperCase()}`} back footer={footer}
      right={canChat ? (
        <Pressable onPress={() => nav.push('Chat', { clientId: req.clientId, providerId: req.providerId })} style={s.chatBtn}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
        </Pressable>
      ) : null}>
      <Card style={{ backgroundColor: st.bg, borderColor: st.bg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name={st.icon} size={30} color={st.color} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: st.color }}>{st.label}</Text>
            <Text style={{ color: colors.text, marginTop: 2 }}>
              {req.status === 'completada' && cashPending
                ? isProvider ? 'El cliente pagará en efectivo. Confirma cuando lo recibas.' : 'Pago en efectivo pendiente de confirmar.'
                : statusText(req.status, isProvider)}
            </Text>
          </View>
        </View>
      </Card>

      {stepIdx >= 0 ? (
        <Card style={{ marginTop: 12 }}>
          {['Solicitada', 'Aceptada', 'En camino', 'En proceso', 'Terminada', 'Pagada', 'Calificada'].map((label, i) => {
            const done = i <= stepIdx;
            const h = req.history && req.history.find((x) => x.status === STATUS_FLOW[i]);
            return (
              <View key={label} style={{ flexDirection: 'row' }}>
                <View style={{ alignItems: 'center', width: 24 }}>
                  <View style={[s.tlDot, done && clay(colors.accent, { tint: colors.accent, depth: 0.3, strong: 0.35 })]}>
                    {done ? <Ionicons name="checkmark" size={11} color="#fff" /> : null}
                  </View>
                  {i < 6 ? <View style={[s.tlLine, i < stepIdx && { backgroundColor: colors.accent }]} /> : null}
                </View>
                <View style={{ flex: 1, marginLeft: 10, paddingBottom: i < 6 ? 12 : 0 }}>
                  <Text style={{ fontWeight: done ? '700' : '500', color: done ? colors.text : colors.textMuted }}>{label}</Text>
                  {h ? <Text style={{ fontSize: 11, color: colors.textMuted }}>{h.at}</Text> : null}
                </View>
              </View>
            );
          })}
        </Card>
      ) : null}

      {resch ? (
        <>
          <SectionTitle>Propón una nueva fecha</SectionTitle>
          <DateTimePicker date={newDate} time={newTime} onDate={setNewDate} onTime={setNewTime} />
        </>
      ) : null}

      <SectionTitle>{isProvider ? 'Cliente' : 'Prestador'}</SectionTitle>
      <Card onPress={isClient ? () => nav.push('ProviderDetail', { id: p.id }) : undefined}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Avatar name={isProvider ? req.clientName : p.name} color={isProvider ? colors.primary : categoryById(p.category).color} logo={isProvider ? null : categoryById(p.category).logo} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontWeight: '800', color: colors.text }}>{isProvider ? req.clientName : p.name}</Text>
            {isProvider ? (
              client && client.clientReviews ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                  <Stars value={client.clientRating} size={12} />
                  <Text style={{ marginLeft: 5, color: colors.textSoft, fontSize: 12 }}>{client.clientRating.toFixed(1)} como cliente ({client.clientReviews})</Text>
                </View>
              ) : (
                <Text style={{ color: colors.textSoft, fontSize: 13 }}>Cliente nuevo · sin calificaciones</Text>
              )
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                <Stars value={ratingOf(p)} size={12} />
                <Text style={{ marginLeft: 5, color: colors.textSoft, fontSize: 12 }}>{ratingOf(p).toFixed(1)}</Text>
              </View>
            )}
          </View>
          {isClient ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
        </View>
      </Card>

      <SectionTitle>Detalles</SectionTitle>
      <Card style={{ paddingVertical: 4 }}>
        <InfoRow icon="construct-outline" label="Servicio" value={req.service} />
        <InfoRow icon="calendar-outline" label="Fecha" value={`${req.date} · ${req.time}`} />
        <InfoRow icon="home-outline" label="Dirección" value={req.address} />
        <InfoRow icon="cash-outline" label="Precio" value={money(req.price)} />
        <View style={{ paddingVertical: 10 }}>
          <Text style={{ color: colors.textSoft, marginBottom: 4 }}>Descripción</Text>
          <Text style={{ color: colors.text, lineHeight: 20 }}>{req.description}</Text>
        </View>
      </Card>

      {req.payment ? (
        <>
          <SectionTitle>Pago</SectionTitle>
          <Card style={{ paddingVertical: 4 }}>
            <InfoRow icon={req.payment.cash ? 'cash-outline' : 'card-outline'} label="Método" value={req.payment.method} />
            {req.payment.pending ? <InfoRow icon="hourglass-outline" label="Estado" value="Por confirmar" /> : null}
            <InfoRow icon="receipt-outline" label="Total pagado" value={money(req.payment.total)} />
            {isProvider ? (
              <>
                <InfoRow icon="remove-circle-outline" label="Comisión ServiCerca" value={`-${money(req.payment.commission)}`} />
                <InfoRow icon="wallet-outline" label="Tu ganancia" value={money(req.payment.total - req.payment.commission)} />
              </>
            ) : null}
            <View style={{ paddingVertical: 10, flexDirection: 'row' }}>
              <Ionicons name="document-text-outline" size={18} color={colors.primary} style={{ width: 26 }} />
              <Text style={{ color: colors.textSoft, flex: 1 }}>CFDI emitido · {req.payment.paidAt}</Text>
            </View>
          </Card>
        </>
      ) : isProvider && ['aceptada', 'en_camino', 'en_proceso', 'completada'].includes(req.status) ? (
        <Card style={{ marginTop: 12 }}>
          <Text style={{ color: colors.textSoft }}>Ganancia estimada: <Text style={{ fontWeight: '800', color: colors.text }}>{money(req.price - commission)}</Text> (comisión del {COMMISSION * 100}% incluida)</Text>
        </Card>
      ) : null}

      {req.providerRating ? (
        <Card style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ flex: 1, color: colors.text, fontWeight: '600' }}>{isProvider ? 'Tu calificación al cliente' : 'El prestador te calificó'}</Text>
            <Stars value={req.providerRating.rating} size={16} />
          </View>
          {req.providerRating.comment ? <Text style={{ color: colors.textSoft, marginTop: 6 }}>{req.providerRating.comment}</Text> : null}
        </Card>
      ) : null}

      {req.myRating ? (
        <Card style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ flex: 1, color: colors.text, fontWeight: '600' }}>{isProvider ? 'El cliente te calificó' : 'Tu calificación al servicio'}</Text>
          <Stars value={req.myRating} size={16} />
        </Card>
      ) : null}
    </Screen>
  );
}

function statusText(status, provider) {
  const c = {
    pendiente: 'Esperando que el prestador confirme la solicitud.',
    aceptada: 'El prestador confirmó la fecha y hora.',
    reprogramada: 'El prestador propone una nueva fecha. Revísala.',
    en_camino: 'El prestador va hacia tu domicilio.',
    en_proceso: 'El trabajo se está realizando.',
    completada: 'Trabajo terminado. Realiza el pago en la app.',
    pagada: 'Pago confirmado. ¡Califica el servicio!',
    calificada: 'Servicio finalizado. ¡Gracias por usar ServiCerca!',
    rechazada: 'El prestador no pudo atender esta solicitud.',
    cancelada: 'Esta solicitud fue cancelada.',
  };
  const pv = {
    pendiente: 'Nueva solicitud. Acepta, rechaza o reprograma.',
    aceptada: 'Confirmada. Avisa cuando vayas en camino.',
    reprogramada: 'Esperando que el cliente acepte la nueva fecha.',
    completada: 'Esperando el pago del cliente.',
    pagada: 'Pago recibido en tu cuenta.',
  };
  return (provider && pv[status]) || c[status];
}

/* ------------------------------ MENSAJES ------------------------------ */
export function Chats() {
  const { state, me } = useStore();
  const nav = useNav();
  const isProvider = me.role === 'prestador';
  const keys = new Set(Object.keys(state.messages));
  state.requests.forEach((r) => {
    if ((isProvider && r.providerId === me.providerId) || (!isProvider && r.clientId === me.id)) keys.add(convKey(r.clientId, r.providerId));
  });
  const convs = [...keys]
    .map((k) => {
      const [clientId, providerId] = k.split('__');
      return { k, clientId, providerId, msgs: state.messages[k] || [] };
    })
    .filter((c) => (isProvider ? c.providerId === me.providerId : c.clientId === me.id));

  return (
    <Screen title="Mensajes" large padded={false}>
      {convs.map((c) => {
        const p = state.providers.find((x) => x.id === c.providerId);
        const client = state.users.find((u) => u.id === c.clientId);
        const name = isProvider ? (client ? client.name : 'Cliente') : p ? p.name : 'Prestador';
        const last = c.msgs[c.msgs.length - 1];
        return (
          <Pressable key={c.k} onPress={() => nav.push('Chat', { clientId: c.clientId, providerId: c.providerId })} style={s.convRow}>
            <Avatar name={name} color={isProvider ? colors.primary : categoryById(p && p.category).color} logo={isProvider ? null : categoryById(p && p.category).logo} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: '800', color: colors.text }}>{name}</Text>
              <Text style={{ color: colors.textSoft, marginTop: 2 }} numberOfLines={1}>{last ? last.text : 'Inicia la conversación'}</Text>
            </View>
            {last ? <Text style={{ color: colors.textMuted, fontSize: 12 }}>{last.at}</Text> : null}
          </Pressable>
        );
      })}
      {!convs.length ? <Empty icon="chatbubbles-outline" title="Sin conversaciones" text="Aquí aparecerán tus mensajes con prestadores y clientes." /> : null}
    </Screen>
  );
}

export function Chat({ params }) {
  const { state, me, actions } = useStore();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const ref = useRef(null);
  const key = convKey(params.clientId, params.providerId);
  const msgs = state.messages[key] || [];
  const p = state.providers.find((x) => x.id === params.providerId);
  const client = state.users.find((u) => u.id === params.clientId);
  const isProvider = me.role === 'prestador';
  const mine = isProvider ? 'provider' : 'client';
  const title = isProvider ? (client ? client.name : 'Cliente') : p ? p.name : 'Prestador';

  useEffect(() => {
    const t = setTimeout(() => ref.current && ref.current.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(t);
  }, [msgs.length]);

  const send = () => {
    if (!text.trim()) return;
    actions.sendMessage(params.clientId, params.providerId, text.trim());
    setText('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title={title} subtitle={isProvider ? 'Cliente' : p ? categoryById(p.category).name : ''} back />
      <ScrollView ref={ref} style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <View style={s.chatNotice}>
          <Ionicons name="lock-closed-outline" size={13} color={colors.textSoft} />
          <Text style={{ color: colors.textSoft, fontSize: 12, marginLeft: 6, flex: 1 }}>
            Por tu seguridad, mantén la comunicación y los pagos dentro de ServiCerca. El historial se conserva de forma segura.
          </Text>
        </View>
        {msgs.map((m) => {
          const own = m.from === mine;
          return (
            <View key={m.id} style={[s.bubble, own ? s.bubbleMine : s.bubbleOther]}>
              <Text style={{ color: own ? '#fff' : colors.text, fontSize: 15, lineHeight: 20 }}>{m.text}</Text>
              <Text style={{ color: own ? '#CFE0F7' : colors.textMuted, fontSize: 10, alignSelf: 'flex-end', marginTop: 3 }}>{m.at}</Text>
            </View>
          );
        })}
      </ScrollView>
      <View style={[s.composer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TextInput value={text} onChangeText={setText} placeholder="Escribe un mensaje…" placeholderTextColor={colors.textMuted}
          style={s.chatInput} multiline onSubmitEditing={send} />
        <Pressable onPress={send} style={[s.sendBtn, !text.trim() && { opacity: 0.4 }]}>
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ------------------------------ NOTIFICACIONES ------------------------------ */
export function Notifications() {
  const { state, me, actions } = useStore();
  const nav = useNav();
  const list = state.notifications.filter((n) => n.userId === me.id);
  useEffect(() => {
    const t = setTimeout(() => actions.markNotificationsRead(), 1200);
    return () => clearTimeout(t);
  }, []);
  return (
    <Screen title="Notificaciones" back padded={false}>
      {list.map((n) => (
        <Pressable key={n.id} onPress={() => n.requestId && nav.push('RequestDetail', { id: n.requestId })}
          style={[s.convRow, !n.read && { backgroundColor: colors.primarySoft }]}>
          <View style={s.ntfIcon}><Ionicons name="notifications" size={18} color={colors.primary} /></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontWeight: '800', color: colors.text }}>{n.title}</Text>
            <Text style={{ color: colors.textSoft, marginTop: 2, lineHeight: 19 }}>{n.body}</Text>
            <Text style={{ color: colors.textMuted, marginTop: 4, fontSize: 11 }}>{n.at}</Text>
          </View>
        </Pressable>
      ))}
      {!list.length ? <Empty icon="notifications-off-outline" title="Sin notificaciones" text="Te avisaremos sobre tus solicitudes y mensajes." /> : null}
    </Screen>
  );
}

/* ------------------------------ CUENTA ------------------------------ */
export function Account() {
  const { state, me, actions } = useStore();
  const nav = useNav();
  const provider = me.providerId ? state.providers.find((p) => p.id === me.providerId) : null;
  const roleLabel = { cliente: 'Cliente', prestador: 'Prestador de servicios', admin: 'Administrador' }[me.role];
  const unread = state.notifications.filter((n) => n.userId === me.id && !n.read).length;

  return (
    <Screen title="Mi cuenta" large>
      <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Avatar name={me.name} size={60} />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={{ fontWeight: '900', fontSize: 18, color: colors.text }}>{me.name}</Text>
          <Text style={{ color: colors.textSoft, marginTop: 2 }}>{me.email}</Text>
          <View style={{ marginTop: 6, flexDirection: 'row' }}>
            <Badge label={roleLabel} />
            {me.role === 'cliente' && me.clientReviews ? (
              <View style={{ marginLeft: 6 }}><Badge label={`${me.clientRating.toFixed(1)} como cliente`} icon="star" color={colors.accentDark} bg={colors.accentSoft} /></View>
            ) : null}
            {provider && provider.premium ? <View style={{ marginLeft: 6 }}><Badge label="Premium" icon="ribbon" color={colors.accentDark} bg={colors.accentSoft} /></View> : null}
          </View>
        </View>
      </Card>

      <SectionTitle>General</SectionTitle>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <ListItem icon="person-outline" title="Editar datos personales" onPress={() => nav.push('EditProfile')} />
        {me.role !== 'admin' ? (
          <ListItem icon="notifications-outline" title="Notificaciones" subtitle={unread ? `${unread} sin leer` : undefined} onPress={() => nav.push('Notifications')} />
        ) : null}
        {me.role === 'cliente' ? (
          <ListItem icon="navigate-outline" title="Ubicación" subtitle={state.locationAllowed ? `Activa · ${state.myZone}` : 'Desactivada'} onPress={() => nav.push('Location')} />
        ) : null}
        {provider ? (
          <>
            <ListItem icon="briefcase-outline" title="Perfil profesional" subtitle="Servicios, tarifa, horario y zona" onPress={() => nav.push('ProviderProfileEdit')} />
            <ListItem icon="ribbon-outline" title="Plan Premium" subtitle={provider.premium ? 'Activo · Perfil destacado' : 'Aparece primero en las búsquedas'} onPress={() => nav.push('Premium')} />
            <ListItem icon="eye-outline" title="Ver mi perfil público" onPress={() => nav.push('ProviderDetail', { id: provider.id })} />
          </>
        ) : null}
      </Card>

      <SectionTitle>Ayuda y legal</SectionTitle>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <ListItem icon="help-buoy-outline" title="Centro de ayuda" subtitle="Preguntas frecuentes y soporte" onPress={() => nav.push('Help')} />
        <ListItem icon="shield-outline" title="Aviso de privacidad" onPress={() => nav.push('Legal', { kind: 'privacy' })} />
        <ListItem icon="document-text-outline" title="Términos y condiciones" onPress={() => nav.push('Legal', { kind: 'terms' })} />
      </Card>

      <SectionTitle>Sesión</SectionTitle>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <ListItem icon="refresh-outline" title="Reiniciar datos de demostración"
          onPress={() => confirm('Reiniciar demo', 'Se borrarán las cuentas, solicitudes y mensajes creados.', actions.resetDemo, 'Reiniciar', true)} />
        {me.role !== 'admin' ? (
          <ListItem icon="trash-outline" title="Eliminar mi cuenta" danger
            onPress={() => confirm('Eliminar cuenta', 'Se eliminarán tus datos personales (derecho de cancelación). Esta acción no se puede deshacer.', actions.deleteAccount, 'Eliminar', true)} />
        ) : null}
        <ListItem icon="log-out-outline" title="Cerrar sesión" danger right={null} onPress={actions.logout} />
      </Card>
      <Text style={{ textAlign: 'center', color: colors.textMuted, marginTop: 20, fontSize: 12 }}>ServiCerca v1.0.0 · MVP ciudad piloto</Text>
    </Screen>
  );
}

export function EditProfile() {
  const { me, actions, showToast } = useStore();
  const nav = useNav();
  const [f, setF] = useState({ name: me.name, phone: me.phone || '', address: me.address || '' });
  return (
    <Screen title="Datos personales" back footer={
      <Button title="Guardar cambios" icon="save-outline" disabled={f.name.trim().length < 3}
        onPress={() => { actions.updateUser({ name: f.name.trim(), phone: f.phone.trim(), address: f.address.trim() }); showToast('Datos actualizados', ''); nav.back(); }} />
    }>
      <Input label="Nombre completo" icon="person-outline" value={f.name} onChangeText={(t) => setF({ ...f, name: t })} />
      <Input label="Correo electrónico" icon="mail-outline" value={me.email} editable={false} />
      <Input label="Teléfono" icon="call-outline" value={f.phone} keyboardType="phone-pad" onChangeText={(t) => setF({ ...f, phone: t })} />
      {me.role === 'cliente' ? (
        <Input label="Dirección principal" icon="home-outline" value={f.address} onChangeText={(t) => setF({ ...f, address: t })} placeholder="Calle, número y colonia" />
      ) : null}
      {me.acceptedTermsAt ? (
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>Aviso de privacidad aceptado el {me.acceptedTermsAt}</Text>
      ) : null}
    </Screen>
  );
}

const FAQ = [
  ['¿Cómo solicito un servicio?', 'Busca por categoría, entra al perfil del prestador y toca "Solicitar servicio". Elige fecha, hora y dirección.'],
  ['¿Cuándo pago?', 'Pagas dentro de la app cuando el prestador marca el trabajo como terminado. Tus datos de tarjeta no se guardan.'],
  ['¿Cómo se verifican los prestadores?', 'El equipo de ServiCerca revisa su identificación oficial y comprobante de domicilio antes de activar su perfil.'],
  ['¿Qué hago si tengo un problema?', 'Usa "Reportar a este prestador" en su perfil o escríbenos desde este centro de ayuda.'],
  ['Soy prestador, ¿cuánto cobra ServiCerca?', `Una comisión del ${COMMISSION * 100}% por cada servicio pagado en la app. Registrarte es gratis.`],
];

export function TicketCard({ t, admin, children }) {
  const open = t.status === 'abierto';
  return (
    <Card style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="chatbox-ellipses-outline" size={18} color={colors.primary} />
        <Text style={{ flex: 1, marginLeft: 8, fontWeight: '800', color: colors.text }} numberOfLines={1}>
          {admin ? t.userName : `Ticket #${t.id}`}
        </Text>
        <Badge label={open ? 'Abierto' : 'Resuelto'} color={open ? colors.warning : colors.success} bg={open ? colors.warningSoft : colors.successSoft} />
      </View>
      {admin ? (
        <Text style={{ color: colors.textSoft, fontSize: 12, marginTop: 4 }}>
          {[t.userRole === 'prestador' ? 'Prestador' : t.userRole === 'cliente' ? 'Cliente' : t.userRole, t.userEmail, t.at].filter(Boolean).join(' · ')}
        </Text>
      ) : (
        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>Enviado {t.at}</Text>
      )}
      <Text style={{ color: colors.text, marginTop: 10, lineHeight: 21 }}>{t.message}</Text>
      {t.reply ? (
        <View style={{ marginTop: 12, padding: 12, borderRadius: 16, backgroundColor: colors.successSoft }}>
          <Text style={{ fontWeight: '800', color: colors.success, fontSize: 12, marginBottom: 4 }}>Respuesta de soporte · {t.repliedAt}</Text>
          <Text style={{ color: colors.text, lineHeight: 20 }}>{t.reply}</Text>
        </View>
      ) : null}
      {children}
    </Card>
  );
}

export function Help() {
  const { state, showToast, actions } = useStore();
  const nav = useNav();
  const [open, setOpen] = useState(0);
  const [msg, setMsg] = useState('');
  return (
    <Screen title="Centro de ayuda" back>
      <SectionTitle>Preguntas frecuentes</SectionTitle>
      {FAQ.map(([q, a], i) => (
        <Card key={q} style={{ marginBottom: 8 }} onPress={() => setOpen(open === i ? -1 : i)}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ flex: 1, fontWeight: '700', color: colors.text }}>{q}</Text>
            <Ionicons name={open === i ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
          </View>
          {open === i ? <Text style={{ color: colors.textSoft, marginTop: 8, lineHeight: 20 }}>{a}</Text> : null}
        </Card>
      ))}
      <SectionTitle>Contactar a soporte</SectionTitle>
      <Input value={msg} onChangeText={setMsg} multiline placeholder="Describe tu problema o duda" />
      <Button title="Enviar a soporte" icon="send-outline" disabled={msg.trim().length < 5}
        onPress={async () => { const r = await actions.sendSupport(msg.trim()); if (r.ok) { setMsg(''); showToast('Ticket creado', 'El equipo de soporte te responderá pronto.'); } }} />

      {(state.tickets || []).length ? (
        <>
          <SectionTitle>Mis tickets</SectionTitle>
          {state.tickets.map((t) => <TicketCard key={t.id} t={t} />)}
        </>
      ) : null}
    </Screen>
  );
}

const s = StyleSheet.create({
  chatBtn: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', ...clay(colors.primarySoft, { depth: 0.6 }) },
  tlDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', ...sunken },
  tlLine: { width: 3, flex: 1, borderRadius: 2, backgroundColor: '#E1E8F3', marginVertical: 2 },
  convRow: { flexDirection: 'row', alignItems: 'center', padding: 16, marginHorizontal: 18, marginTop: 12, borderRadius: 26, ...clay(colors.card, { depth: 0.7 }) },
  chatNotice: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 18, marginBottom: 16, ...sunken },
  bubble: { maxWidth: '80%', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 22, marginBottom: 12 },
  bubbleMine: { alignSelf: 'flex-end', borderBottomRightRadius: 6, ...clay(colors.primary, { depth: 0.55, strong: 0.25 }) },
  bubbleOther: { alignSelf: 'flex-start', borderBottomLeftRadius: 6, ...clay(colors.card, { depth: 0.55 }) },
  composer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 14, paddingTop: 12, borderTopLeftRadius: 30, borderTopRightRadius: 30, ...clay(colors.card) },
  chatInput: { flex: 1, minHeight: 48, maxHeight: 110, borderRadius: 24, paddingHorizontal: 18, paddingTop: 13, paddingBottom: 11, fontSize: 15, color: colors.text, ...sunken },
  sendBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginLeft: 10, ...clay(colors.accent, { tint: colors.accent, depth: 0.6, strong: 0.35 }) },
  ntfIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', ...clay(colors.primarySoft, { depth: 0.5 }) },
});
