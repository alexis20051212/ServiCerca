// Paleta tomada del logotipo de ServiCerca (azul marino + naranja) en estilo claymorphism
export const colors = {
  primary: '#14365E',
  primaryDark: '#0E2747',
  primarySoft: '#E3ECFA',
  accent: '#F7801F',
  accentDark: '#D9670A',
  accentSoft: '#FFE9D6',
  bg: '#EEF2FB',
  card: '#FFFFFF',
  text: '#13243A',
  textSoft: '#5D6B7E',
  textMuted: '#97A3B6',
  border: '#E3E9F3',
  success: '#22A06B',
  successSoft: '#DDF5E8',
  danger: '#E05252',
  dangerSoft: '#FDE3E3',
  warning: '#C97A0A',
  warningSoft: '#FFF0D6',
  purple: '#7B61D9',
  purpleSoft: '#ECE6FD',
};

// Tonos pastel para las "almohaditas" de categoría
export const pastel = {
  plomeria: '#D9E8FF',
  electricidad: '#FFF0C7',
  mecanica: '#FFDCC8',
  cerrajeria: '#E7DEFF',
  limpieza: '#D2F4F1',
  jardineria: '#D8F3DE',
  computadoras: '#DDE5F2',
  electrodomesticos: '#FFDDE6',
  mantenimiento: '#F6E3D2',
};

export const radius = { sm: 14, md: 20, lg: 28, xl: 36 };

// ---- Claymorphism ----------------------------------------------------------
// Sombra exterior suave (flota) + luz interior arriba-izquierda + sombra interior
// abajo-derecha (relieve "inflado").
const rgba = (hex, a) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

export function clay(bg = colors.card, { tint = colors.primary, depth = 1, strong = 0.16 } = {}) {
  const d = depth;
  return {
    backgroundColor: bg,
    boxShadow: [
      `${6 * d}px ${10 * d}px ${22 * d}px ${rgba(tint, strong)}`,
      `inset ${-4 * d}px ${-5 * d}px ${10 * d}px ${rgba('#0A1A33', 0.08)}`,
      `inset ${4 * d}px ${5 * d}px ${9 * d}px rgba(255, 255, 255, 0.75)`,
    ].join(', '),
  };
}

// Elemento presionado: se "hunde"
export function clayPressed(bg = colors.card) {
  return {
    backgroundColor: bg,
    boxShadow: [
      `1px 2px 5px ${rgba(colors.primary, 0.1)}`,
      `inset 4px 5px 10px ${rgba('#0A1A33', 0.14)}`,
      'inset -3px -4px 8px rgba(255, 255, 255, 0.6)',
    ].join(', '),
  };
}

// Campo hundido (inputs, buscador)
export const sunken = {
  backgroundColor: '#F4F7FD',
  boxShadow: `inset 3px 4px 8px ${rgba('#14365E', 0.13)}, inset -3px -4px 8px rgba(255, 255, 255, 0.95)`,
};

// Compatibilidad con estilos que usaban "shadow"
export const shadow = {
  boxShadow: `6px 10px 22px ${rgba('#14365E', 0.14)}, inset -4px -5px 10px rgba(10, 26, 51, 0.06), inset 4px 5px 9px rgba(255, 255, 255, 0.75)`,
};

export { rgba };

export const COMMISSION = 0.1; // 10 % de comisión para la plataforma

export const money = (n) =>
  '$' + Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const STATUS = {
  pendiente: { label: 'Pendiente', color: colors.warning, bg: colors.warningSoft, icon: 'time-outline' },
  aceptada: { label: 'Aceptada', color: colors.primary, bg: colors.primarySoft, icon: 'checkmark-circle-outline' },
  reprogramada: { label: 'Reprogramada', color: colors.purple, bg: colors.purpleSoft, icon: 'calendar-outline' },
  en_camino: { label: 'En camino', color: colors.primary, bg: colors.primarySoft, icon: 'car-outline' },
  en_proceso: { label: 'En proceso', color: colors.purple, bg: colors.purpleSoft, icon: 'construct-outline' },
  completada: { label: 'Por pagar', color: colors.warning, bg: colors.warningSoft, icon: 'card-outline' },
  pagada: { label: 'Pagada', color: colors.success, bg: colors.successSoft, icon: 'cash-outline' },
  calificada: { label: 'Finalizada', color: colors.success, bg: colors.successSoft, icon: 'star-outline' },
  rechazada: { label: 'Rechazada', color: colors.danger, bg: colors.dangerSoft, icon: 'close-circle-outline' },
  cancelada: { label: 'Cancelada', color: colors.textMuted, bg: '#EEF1F5', icon: 'ban-outline' },
};

export const STATUS_FLOW = ['pendiente', 'aceptada', 'en_camino', 'en_proceso', 'completada', 'pagada', 'calificada'];
