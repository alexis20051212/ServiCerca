// Datos de demostración de la ciudad piloto (MVP).
export const CATEGORIES = [
  { id: 'plomeria', name: 'Plomería', role: 'Fontanero', icon: 'water-outline', color: '#1F6FD1', logo: require('../assets/roles/plomeria.png') },
  { id: 'electricidad', name: 'Electricidad', role: 'Electricista', icon: 'flash-outline', color: '#E09A10', logo: require('../assets/roles/electricidad.png') },
  { id: 'mecanica', name: 'Mecánica', role: 'Mecánico', icon: 'car-outline', color: '#C2410C', logo: require('../assets/roles/mecanica.png') },
  { id: 'cerrajeria', name: 'Cerrajería', icon: 'key-outline', color: '#7451C9' },
  { id: 'limpieza', name: 'Limpieza', role: 'Encargado de limpieza', icon: 'sparkles-outline', color: '#14A3A3', logo: require('../assets/roles/limpieza.png') },
  { id: 'jardineria', name: 'Jardinería', role: 'Jardinero', icon: 'leaf-outline', color: '#1E9E61', logo: require('../assets/roles/jardineria.png') },
  { id: 'computadoras', name: 'Computadoras', short: 'Cómputo', icon: 'laptop-outline', color: '#3D5A80' },
  { id: 'electrodomesticos', name: 'Electrodomésticos', short: 'Línea blanca', icon: 'tv-outline', color: '#D45D79' },
  { id: 'mantenimiento', name: 'Instalación y mantenimiento', short: 'Instalación', icon: 'hammer-outline', color: '#B5652B' },
];

export const categoryById = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

export const ZONES = ['Centro', 'Zona Norte', 'Zona Sur', 'Zona Oriente', 'Zona Poniente'];

const demo = require('./demoData');
export const PROVIDERS = demo.PROVIDERS;
export const DEMO_USERS = demo.DEMO_USERS;
export const DEMO_REPORTS = demo.DEMO_REPORTS;

export const PRIVACY_NOTICE = `AVISO DE PRIVACIDAD SIMPLIFICADO

ServiCerca es responsable del tratamiento de los datos personales que nos proporcione (nombre, correo, teléfono, dirección, ubicación y, en el caso de prestadores, documentos de identidad).

Finalidades: crear y administrar su cuenta; conectar a clientes con prestadores de servicios cercanos; procesar solicitudes y pagos mediante una pasarela certificada; verificar la identidad de los prestadores; atender aclaraciones, reportes y soporte.

Ubicación: se utiliza únicamente para mostrar prestadores cercanos y para el servicio solicitado, y solo con su permiso.

Pagos: ServiCerca no almacena datos de tarjetas; el cobro se realiza mediante una pasarela de pagos certificada PCI DSS.

Derechos ARCO: puede solicitar el acceso, rectificación, cancelación u oposición al tratamiento de sus datos desde la sección "Mi cuenta > Privacidad" o escribiendo a privacidad@servicerca.mx.

Este aviso se emite conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.`;

export const TERMS = `TÉRMINOS Y CONDICIONES (resumen)

1. ServiCerca es una plataforma intermediaria que conecta clientes con trabajadores independientes. Los prestadores no son empleados de ServiCerca.
2. El precio del servicio se informa antes de confirmar la solicitud.
3. ServiCerca cobra una comisión del 10% por cada servicio pagado dentro de la aplicación, la cual se descuenta al prestador.
4. Solo los clientes con un servicio realizado pueden calificar al prestador.
5. Los reportes por fraude o mal servicio serán revisados por el equipo de administración.
6. La aceptación de estos términos por medios electrónicos tiene plena validez conforme al Código de Comercio.`;
