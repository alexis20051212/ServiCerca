import React from 'react';
import {
  ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { clay, clayPressed, colors, pastel, radius, rgba, STATUS, sunken } from './theme';
import { useNav } from './nav';
import { categoryById } from './data';
import { ratingOf } from './store';

export function Header({ title, subtitle, back, right, large }) {
  const insets = useSafeAreaInsets();
  const nav = useNav();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerRow}>
        {back ? (
          <Pressable onPress={nav.back} hitSlop={12} style={({ pressed }) => [styles.iconBtn, pressed ? clayPressed() : clay(colors.card, { depth: 0.6 })]}>
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </Pressable>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, large && { fontSize: 28 }]} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.headerSub} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </View>
  );
}

export function Screen({ title, subtitle, back, right, children, scroll = true, footer, large, padded = true }) {
  const insets = useSafeAreaInsets();
  const Body = scroll ? ScrollView : View;
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {title !== undefined ? <Header title={title} subtitle={subtitle} back={back} right={right} large={large} /> : null}
      <Body
        style={{ flex: 1 }}
        contentContainerStyle={scroll ? [padded && { padding: 18 }, { paddingBottom: 40 }] : undefined}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </Body>
      {footer ? <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>{footer}</View> : null}
    </KeyboardAvoidingView>
  );
}

export function Button({ title, onPress, variant = 'primary', icon, disabled, loading, style, small }) {
  const v = {
    primary: { bg: colors.primary, fg: '#fff', tint: colors.primary },
    accent: { bg: colors.accent, fg: '#FFFFFF', tint: colors.accent },
    outline: { bg: colors.card, fg: colors.primary, tint: colors.primary },
    ghost: { bg: colors.primarySoft, fg: colors.primary, tint: colors.primary },
    danger: { bg: colors.dangerSoft, fg: colors.danger, tint: colors.danger },
    success: { bg: colors.success, fg: '#fff', tint: colors.success },
  }[variant];
  const solid = ['primary', 'accent', 'success'].includes(variant);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSmall,
        pressed
          ? { ...clayPressed(v.bg), transform: [{ scale: 0.98 }] }
          : {
              backgroundColor: v.bg,
              boxShadow: [
                `${small ? 3 : 5}px ${small ? 5 : 9}px ${small ? 12 : 20}px ${rgba(v.tint, solid ? 0.35 : 0.16)}`,
                `inset -3px -5px 9px ${solid ? 'rgba(0, 0, 0, 0.18)' : 'rgba(10, 26, 51, 0.07)'}`,
                `inset 3px 4px 8px rgba(255, 255, 255, ${solid ? 0.32 : 0.8})`,
              ].join(', '),
            },
        disabled && { opacity: 0.45 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={small ? 16 : 19} color={v.fg} style={{ marginRight: title ? 8 : 0 }} /> : null}
          {title ? <Text style={[styles.btnText, small && { fontSize: 14 }, { color: v.fg }]}>{title}</Text> : null}
        </>
      )}
    </Pressable>
  );
}

export function Card({ children, style, onPress }) {
  if (onPress)
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, clay(), style, pressed && { ...clayPressed(), transform: [{ scale: 0.985 }] }]}>
        {children}
      </Pressable>
    );
  return <View style={[styles.card, clay(), style]}>{children}</View>;
}

export function Input({ label, icon, error, style, multiline, ...props }) {
  return (
    <View style={[{ marginBottom: 14 }, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrap, sunken, error && { borderWidth: 1.5, borderColor: colors.danger }, multiline && { alignItems: 'flex-start' }]}>
        {icon ? <Ionicons name={icon} size={19} color={colors.textMuted} style={{ marginRight: 8, marginTop: multiline ? 12 : 0 }} /> : null}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, multiline && { minHeight: 90, textAlignVertical: 'top', paddingTop: 12 }]}
          multiline={multiline}
          {...props}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function Chip({ label, active, onPress, icon, logo }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, pressed ? clayPressed(active ? colors.accent : colors.card) : clay(active ? colors.accent : colors.card, { tint: active ? colors.accent : colors.primary, depth: 0.55, strong: active ? 0.3 : 0.12 })]}>
      {logo ? <Image source={logo} style={{ width: 18, height: 18, marginRight: 5, tintColor: active ? '#fff' : colors.textSoft }} /> : icon ? <Ionicons name={icon} size={14} color={active ? '#fff' : colors.textSoft} style={{ marginRight: 5 }} /> : null}
      <Text style={[styles.chipText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ label, color = colors.primary, bg = colors.primarySoft, icon }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {icon ? <Ionicons name={icon} size={12} color={color} style={{ marginRight: 4 }} /> : null}
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pendiente;
  return <Badge label={s.label} color={s.color} bg={s.bg} icon={s.icon} />;
}

export function Stars({ value = 0, size = 14, onChange }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const name = value >= i ? 'star' : value >= i - 0.5 ? 'star-half' : 'star-outline';
        const icon = <Ionicons name={name} size={size} color={colors.accent} style={{ marginRight: onChange ? 6 : 1 }} />;
        return onChange ? (
          <Pressable key={i} onPress={() => onChange(i)} hitSlop={6}>{icon}</Pressable>
        ) : (
          <View key={i}>{icon}</View>
        );
      })}
    </View>
  );
}

// Logotipo de ServiCerca
export function Logo({ variant = 'full', height = 40, style }) {
  const src = variant === 'mark' ? require('../assets/logo-mark.png') : require('../assets/logo-full.png');
  const ratio = variant === 'mark' ? 828 / 732 : 1791 / 549;
  return <Image source={src} style={[{ height, width: height * ratio }, style]} resizeMode="contain" />;
}

// Logo del rol (fontanero, electricista, mecánico, jardinero, limpieza) o ícono de la categoría
export function CategoryIcon({ category, size = 26, color }) {
  const tint = color || category.color;
  if (category.logo) return <Image source={category.logo} style={{ width: size * 1.35, height: size * 1.35, tintColor: tint }} resizeMode="contain" />;
  return <Ionicons name={category.icon} size={size} color={tint} />;
}

// Mezcla un color con blanco para obtener su versión pastel
function mix(hex, amount = 0.82) {
  if (!hex || hex[0] !== '#' || hex.length !== 7) return '#F1F4FA';
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.round(v + (255 - v) * amount);
  const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
export const pastelOf = (category) => pastel[category && category.id] || mix(category && category.color);

export function Avatar({ name = '?', size = 48, color = colors.primary, logo }) {
  if (logo)
    return (
      <View style={[{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }, clay(mix(color), { tint: color, depth: Math.min(1, size / 70), strong: 0.18 })]}>
        <Image source={logo} style={{ width: size * 0.78, height: size * 0.78, tintColor: color }} resizeMode="contain" />
      </View>
    );
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }, clay(mix(color), { tint: color, depth: Math.min(1, size / 70), strong: 0.18 })]}>
      <Text style={{ color, fontWeight: '800', fontSize: size * 0.36 }}>{initials}</Text>
    </View>
  );
}

export function Empty({ icon = 'file-tray-outline', title, text, action }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 }}>
      <View style={[styles.emptyIcon, clay(colors.primarySoft)]}>
        <Ionicons name={icon} size={34} color={colors.primary} />
      </View>
      <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text, marginTop: 14, textAlign: 'center' }}>{title}</Text>
      {text ? <Text style={{ color: colors.textSoft, textAlign: 'center', marginTop: 6, lineHeight: 20 }}>{text}</Text> : null}
      {action ? <View style={{ marginTop: 18, alignSelf: 'stretch' }}>{action}</View> : null}
    </View>
  );
}

export function SectionTitle({ children, action, onAction }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 12, paddingHorizontal: 2 }}>
      <Text style={{ flex: 1, fontSize: 17, fontWeight: '800', color: colors.text }}>{children}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={colors.primary} style={{ width: 26 }} />
      <Text style={{ color: colors.textSoft, flex: 1 }}>{label}</Text>
      <Text style={{ color: colors.text, fontWeight: '600', flexShrink: 1, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

export function ListItem({ icon, title, subtitle, onPress, right, danger }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.listItem, pressed && { backgroundColor: '#F3F6FC' }]}>
      <View style={[styles.listIcon, clay(danger ? colors.dangerSoft : colors.primarySoft, { depth: 0.45, tint: danger ? colors.danger : colors.primary })]}>
        <Ionicons name={icon} size={19} color={danger ? colors.danger : colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '600', color: danger ? colors.danger : colors.text, fontSize: 15 }}>{title}</Text>
        {subtitle ? <Text style={{ color: colors.textSoft, fontSize: 13, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
      {right !== undefined ? right : <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
    </Pressable>
  );
}

export function ProviderCard({ provider, onPress }) {
  const cat = categoryById(provider.category);
  const rating = ratingOf(provider);
  return (
    <Card onPress={onPress} style={[{ marginBottom: 14 }, provider.premium && { backgroundColor: '#FFFAF5' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Avatar name={provider.name} color={cat.color} logo={cat.logo} size={54} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontWeight: '800', fontSize: 16, color: colors.text, flexShrink: 1 }} numberOfLines={1}>{provider.name}</Text>
            {provider.verified ? <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={{ marginLeft: 5 }} /> : null}
          </View>
          <Text style={{ color: colors.textSoft, marginTop: 2 }}>{cat.name} · {provider.years} años de exp.</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
            <Stars value={rating} size={13} />
            <Text style={{ marginLeft: 5, color: colors.textSoft, fontSize: 12 }}>
              {rating ? rating.toFixed(1) : 'Nuevo'} ({provider.reviews.length})
            </Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontWeight: '800', color: colors.primary, fontSize: 16 }}>${provider.rate}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>por visita</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
            <Ionicons name="location-outline" size={13} color={colors.textSoft} />
            <Text style={{ color: colors.textSoft, fontSize: 12 }}>{provider.distance.toFixed(1)} km</Text>
          </View>
        </View>
      </View>
      {provider.premium ? (
        <View style={[styles.premiumTag, clay(colors.accent, { tint: colors.accent, depth: 0.4, strong: 0.35 })]}>
          <Ionicons name="ribbon" size={12} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800', marginLeft: 4 }}>DESTACADO</Text>
        </View>
      ) : null}
    </Card>
  );
}

export const styles = StyleSheet.create({
  header: { backgroundColor: colors.bg, paddingHorizontal: 20, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', minHeight: 46 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  headerSub: { color: colors.textSoft, marginTop: 2, fontSize: 14 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  footer: { paddingHorizontal: 20, paddingTop: 16, borderTopLeftRadius: 32, borderTopRightRadius: 32, ...clay(colors.card, { depth: 0.9 }) },
  btn: { minHeight: 56, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', paddingHorizontal: 22 },
  btnSmall: { minHeight: 42, paddingHorizontal: 16, borderRadius: 16 },
  btnText: { fontSize: 16.5, fontWeight: '800', letterSpacing: 0.2 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 18 },
  label: { fontWeight: '700', color: colors.text, marginBottom: 8, fontSize: 14.5, marginLeft: 4 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 16 },
  input: { flex: 1, minHeight: 54, fontSize: 16, color: colors.text },
  error: { color: colors.danger, marginTop: 6, fontSize: 13, marginLeft: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 999, marginRight: 10, marginVertical: 6 },
  chipText: { color: colors.textSoft, fontWeight: '700', fontSize: 14 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999, alignSelf: 'flex-start' },
  badgeText: { fontWeight: '800', fontSize: 12 },
  emptyIcon: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#EEF2F8' },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  listIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  premiumTag: { position: 'absolute', top: -11, right: 18, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
});

// Confirmación compatible con móvil y web
export function confirm(title, message, onOk, okText = 'Aceptar', destructive) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (window.confirm(`${title}\n\n${message}`)) onOk();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: okText, style: destructive ? 'destructive' : 'default', onPress: onOk },
  ]);
}
