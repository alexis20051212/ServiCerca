import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Chip, Input, Logo, Screen, pastelOf } from '../components';
import { clay, colors, radius } from '../theme';
import { useNav } from '../nav';
import { useStore } from '../store';
import { CATEGORIES, PRIVACY_NOTICE, TERMS, ZONES } from '../data';

export function Welcome() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const roles = CATEGORIES.filter((c) => c.logo);
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 24, paddingHorizontal: 26, paddingBottom: insets.bottom + 24 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Logo height={70} />
        <Text style={s.tagline}>Profesionales de confianza,{'\n'}cerca de ti.</Text>

        <View style={s.rolesWrap}>
          {roles.map((c, i) => (
            <View key={c.id} style={[s.roleBubble, i % 2 === 1 && { marginTop: 22 }, clay(pastelOf(c), { tint: c.color, depth: 0.7, strong: 0.24 })]}>
              <Image source={c.logo} style={{ width: 40, height: 40, tintColor: c.color }} resizeMode="contain" />
            </View>
          ))}
        </View>
      </View>

      <Button title="Crear cuenta" variant="accent" onPress={() => nav.push('Register')} />
      <Button title="Iniciar sesión" variant="outline" onPress={() => nav.push('Login')} style={{ marginTop: 14 }} />
    </View>
  );
}

export function Login() {
  const { actions } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const submit = async (e = email, p = password) => {
    if (!e || !p) return setError('Ingresa tu correo y contraseña.');
    setLoading(true);
    const err = await actions.login(e, p);
    if (err) { setError(err); setLoading(false); }
  };

  return (
    <Screen title="" back>
      <View style={{ alignItems: 'center', marginBottom: 26 }}>
        <Logo variant="mark" height={72} />
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 14 }}>¡Hola de nuevo!</Text>
        <Text style={{ color: colors.textSoft, fontSize: 15, marginTop: 4 }}>Inicia sesión para continuar</Text>
      </View>
      <Input label="Correo electrónico" icon="mail-outline" value={email} onChangeText={(t) => { setEmail(t); setError(''); }}
        autoCapitalize="none" keyboardType="email-address" placeholder="tucorreo@ejemplo.com" />
      <Input label="Contraseña" icon="lock-closed-outline" value={password} onChangeText={(t) => { setPassword(t); setError(''); }}
        secureTextEntry={!show} placeholder="••••" />
      <Pressable onPress={() => setShow(!show)} style={{ alignSelf: 'flex-end', marginTop: -6, marginBottom: 12 }}>
        <Text style={{ color: colors.primary, fontWeight: '600' }}>{show ? 'Ocultar' : 'Mostrar'} contraseña</Text>
      </Pressable>
      {error ? <Text style={{ color: colors.danger, marginBottom: 12, fontWeight: '600' }}>{error}</Text> : null}
      <Button title="Entrar" icon="log-in-outline" loading={loading} onPress={() => submit()} />

      <Pressable onPress={() => setShowDemo(!showDemo)} style={{ alignSelf: 'center', marginTop: 26, padding: 8 }}>
        <Text style={{ color: colors.textSoft, fontWeight: '600' }}>
          {showDemo ? 'Ocultar cuentas de prueba' : '¿Solo quieres probar? Usa una cuenta demo'}
        </Text>
      </Pressable>
      {showDemo ? (
        <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: 6 }}>
          {[['person', 'Cliente', 'cliente@demo.com'], ['construct', 'Prestador', 'prestador@demo.com'], ['shield', 'Admin', 'admin@demo.com']].map(([icon, label, mail]) => (
            <Chip key={mail} label={label} icon={icon} onPress={() => submit(mail, '1234')} />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

export function Register() {
  const { actions } = useStore();
  const nav = useNav();
  const [role, setRole] = useState('cliente');
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', category: 'plomeria', rate: '', zone: 'Centro', years: '' });
  const [accept, setAccept] = useState(false);
  const [errors, setErrors] = useState({});
  const set = (k) => (v) => { setF({ ...f, [k]: v }); setErrors({ ...errors, [k]: null }); };

  const [saving, setSaving] = useState(false);
  const submit = async () => {
    const e = {};
    if (f.name.trim().length < 3) e.name = 'Escribe tu nombre completo.';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Correo no válido.';
    if (f.phone.replace(/\D/g, '').length < 10) e.phone = 'Teléfono a 10 dígitos.';
    if (f.password.length < 4) e.password = 'Mínimo 4 caracteres.';
    if (role === 'prestador' && !(Number(f.rate) > 0)) e.rate = 'Indica tu tarifa por visita.';
    if (!accept) e.accept = 'Debes aceptar el aviso de privacidad y los términos.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    const err = await actions.register({ ...f, role });
    if (err) { setErrors({ email: err }); setSaving(false); }
  };

  return (
    <Screen title="Crear cuenta" subtitle="Regístrate en menos de un minuto" back
      footer={<Button title="Crear mi cuenta" icon="person-add-outline" loading={saving} onPress={submit} />}>
      <Text style={{ fontWeight: '700', marginBottom: 8, color: colors.text }}>¿Cómo usarás ServiCerca?</Text>
      <View style={{ flexDirection: 'row', marginBottom: 18 }}>
        {[
          ['cliente', 'person-outline', 'Necesito un servicio'],
          ['prestador', 'construct-outline', 'Ofrezco servicios'],
        ].map(([r, icon, label]) => (
          <Pressable key={r} onPress={() => setRole(r)} style={[s.roleCard, role === r && s.roleActive, r === 'cliente' && { marginRight: 10 }]}>
            <Ionicons name={icon} size={26} color={role === r ? colors.accentDark : colors.textSoft} />
            <Text style={[s.roleText, role === r && { color: colors.accentDark }]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <Input label="Nombre completo" icon="person-outline" value={f.name} onChangeText={set('name')} error={errors.name} placeholder="Nombre y apellidos" />
      <Input label="Correo electrónico" icon="mail-outline" value={f.email} onChangeText={set('email')} error={errors.email}
        autoCapitalize="none" keyboardType="email-address" placeholder="tucorreo@ejemplo.com" />
      <Input label="Teléfono" icon="call-outline" value={f.phone} onChangeText={set('phone')} error={errors.phone} keyboardType="phone-pad" placeholder="10 dígitos" />
      <Input label="Contraseña" icon="lock-closed-outline" value={f.password} onChangeText={set('password')} error={errors.password} secureTextEntry placeholder="Mínimo 4 caracteres" />

      {role === 'prestador' ? (
        <>
          <Text style={{ fontWeight: '700', marginBottom: 8, color: colors.text }}>Categoría de servicio</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            {CATEGORIES.map((c) => (
              <Chip key={c.id} label={c.name} icon={c.icon} logo={c.logo} active={f.category === c.id} onPress={() => set('category')(c.id)} />
            ))}
          </ScrollView>
          <View style={{ flexDirection: 'row' }}>
            <Input style={{ flex: 1, marginRight: 10 }} label="Tarifa por visita ($)" icon="cash-outline" value={f.rate} onChangeText={set('rate')}
              error={errors.rate} keyboardType="numeric" placeholder="300" />
            <Input style={{ flex: 1 }} label="Años de experiencia" icon="ribbon-outline" value={f.years} onChangeText={set('years')} keyboardType="numeric" placeholder="5" />
          </View>
          <Text style={{ fontWeight: '700', marginBottom: 8, color: colors.text }}>Zona de cobertura</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            {ZONES.map((z) => <Chip key={z} label={z} active={f.zone === z} onPress={() => set('zone')(z)} />)}
          </ScrollView>
          <View style={s.note}>
            <Ionicons name="information-circle-outline" size={18} color={colors.warning} />
            <Text style={{ flex: 1, marginLeft: 8, color: colors.text, fontSize: 13 }}>
              Tu perfil será revisado por el equipo de ServiCerca (identidad y documentos) antes de aparecer en las búsquedas.
            </Text>
          </View>
        </>
      ) : null}

      <Pressable onPress={() => { setAccept(!accept); setErrors({ ...errors, accept: null }); }} style={s.checkRow}>
        <Ionicons name={accept ? 'checkbox' : 'square-outline'} size={22} color={errors.accept ? colors.danger : colors.primary} />
        <Text style={{ flex: 1, marginLeft: 10, color: colors.text, lineHeight: 20 }}>
          He leído y acepto el{' '}
          <Text style={s.link} onPress={() => nav.push('Legal', { kind: 'privacy' })}>Aviso de privacidad</Text> y los{' '}
          <Text style={s.link} onPress={() => nav.push('Legal', { kind: 'terms' })}>Términos y condiciones</Text>.
        </Text>
      </Pressable>
      {errors.accept ? <Text style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>{errors.accept}</Text> : null}
    </Screen>
  );
}

export function Legal({ params }) {
  const privacy = params.kind === 'privacy';
  return (
    <Screen title={privacy ? 'Aviso de privacidad' : 'Términos y condiciones'} back>
      <Card>
        <Text style={{ color: colors.text, lineHeight: 22 }}>{privacy ? PRIVACY_NOTICE : TERMS}</Text>
      </Card>
    </Screen>
  );
}

const s = StyleSheet.create({
  tagline: { color: colors.textSoft, fontSize: 19, lineHeight: 27, marginTop: 18, textAlign: 'center', fontWeight: '600' },
  rolesWrap: { flexDirection: 'row', justifyContent: 'center', marginTop: 44, marginBottom: 20 },
  roleBubble: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginHorizontal: 5 },
  roleName: { fontSize: 11.5, color: colors.textSoft, marginTop: 6, fontWeight: '600' },
  featuresCard: { borderRadius: 30, padding: 20, ...clay(colors.card) },
  feature: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  featureIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14, ...clay(colors.accentSoft, { tint: colors.accent, depth: 0.45 }) },
  featureText: { color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 },
  demoRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 18, marginBottom: 10, ...clay(colors.card, { depth: 0.5 }) },
  roleCard: { flex: 1, alignItems: 'center', padding: 18, borderRadius: 26, ...clay(colors.card, { depth: 0.7 }) },
  roleActive: { ...clay(colors.accentSoft, { tint: colors.accent, depth: 0.7, strong: 0.25 }) },
  roleText: { marginTop: 8, fontWeight: '700', color: colors.textSoft, textAlign: 'center' },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 6 },
  link: { color: colors.accentDark, fontWeight: '700', textDecorationLine: 'underline' },
  note: { flexDirection: 'row', padding: 14, borderRadius: 20, marginBottom: 16, ...clay(colors.warningSoft, { tint: colors.warning, depth: 0.5, strong: 0.12 }) },
});
