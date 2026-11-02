// Datos de demostración de la ciudad piloto.
// Archivo CommonJS: lo usan la app y el servidor (para llenar MySQL la primera vez).
const r = (author, rating, text, date) => ({ author, rating, text, date });

const PROVIDERS = [
  {
    id: 'p1', userId: 'u2', name: 'Juan Pérez Morales', category: 'plomeria', rate: 350, distance: 1.2,
    zone: 'Centro', schedule: 'Lun a Sáb · 8:00 – 19:00', years: 12, verified: true, premium: true, active: true,
    phone: '449 555 0101',
    description: 'Plomero con más de 12 años de experiencia. Reparación de fugas, instalación de tinacos, boilers y destapes.',
    services: ['Reparación de fugas', 'Destape de drenaje', 'Instalación de boiler', 'Cambio de llaves'],
    reviews: [
      r('Laura G.', 5, 'Llegó puntual y resolvió la fuga en menos de una hora. Muy recomendable.', '2026-10-21'),
      r('Carlos M.', 5, 'Excelente trabajo con el boiler, precio justo.', '2026-10-09'),
      r('Ana R.', 4, 'Buen servicio, solo tardó un poco en confirmar.', '2026-09-28'),
    ],
  },
  {
    id: 'p2', name: 'Roberto Sánchez', category: 'electricidad', rate: 400, distance: 2.4,
    zone: 'Zona Norte', schedule: 'Lun a Vie · 9:00 – 18:00', years: 8, verified: true, premium: false, active: true,
    phone: '449 555 0102',
    description: 'Electricista certificado. Instalaciones residenciales, cortos circuitos, centros de carga y luminarias.',
    services: ['Cortos circuitos', 'Instalación de contactos', 'Centro de carga', 'Luminarias LED'],
    reviews: [
      r('Miguel T.', 5, 'Encontró el corto rápidamente. Muy profesional.', '2026-10-18'),
      r('Sofía L.', 4, 'Buen trabajo y limpio.', '2026-10-02'),
    ],
  },
  {
    id: 'p3', name: 'Cerrajería Hernández', category: 'cerrajeria', rate: 300, distance: 0.8,
    zone: 'Centro', schedule: 'Todos los días · 24 horas', years: 15, verified: true, premium: true, active: true,
    phone: '449 555 0103',
    description: 'Apertura de puertas y autos, cambio de chapas y duplicado de llaves. Servicio de emergencia 24/7.',
    services: ['Apertura de puertas', 'Cambio de chapas', 'Apertura de autos', 'Cerraduras digitales'],
    reviews: [
      r('Jorge P.', 5, 'Me abrió la puerta a las 2 a.m. en 20 minutos. ¡Gracias!', '2026-10-25'),
      r('Daniela C.', 5, 'Rápido y honesto.', '2026-10-11'),
      r('Luis F.', 4, 'Buen servicio.', '2026-09-15'),
    ],
  },
  {
    id: 'p4', name: 'María López', category: 'limpieza', rate: 220, distance: 3.1,
    zone: 'Zona Sur', schedule: 'Lun a Sáb · 7:00 – 15:00', years: 6, verified: true, premium: false, active: true,
    phone: '449 555 0104',
    description: 'Limpieza profunda de casas y departamentos, lavado de salas y alfombras.',
    services: ['Limpieza general', 'Limpieza profunda', 'Lavado de salas', 'Limpieza post-obra'],
    reviews: [
      r('Patricia V.', 5, 'Dejó la casa impecable.', '2026-10-20'),
      r('Fernando D.', 4, 'Muy detallista.', '2026-10-05'),
    ],
  },
  {
    id: 'p5', name: 'Jardines Verdes', category: 'jardineria', rate: 280, distance: 4.5,
    zone: 'Zona Poniente', schedule: 'Mar a Dom · 7:00 – 17:00', years: 10, verified: true, premium: false, active: true,
    phone: '449 555 0105',
    description: 'Poda de árboles, corte de pasto, diseño de jardines y sistemas de riego.',
    services: ['Corte de pasto', 'Poda de árboles', 'Diseño de jardín', 'Sistema de riego'],
    reviews: [r('Ricardo N.', 4, 'El jardín quedó muy bien.', '2026-10-14')],
  },
  {
    id: 'p6', name: 'TecnoFix · Andrés Ruiz', category: 'computadoras', rate: 300, distance: 1.9,
    zone: 'Centro', schedule: 'Lun a Sáb · 10:00 – 20:00', years: 7, verified: true, premium: true, active: true,
    phone: '449 555 0106',
    description: 'Reparación y mantenimiento de laptops y PCs, eliminación de virus, formateo y redes Wi-Fi.',
    services: ['Formateo', 'Eliminación de virus', 'Cambio de pantalla', 'Configuración de red'],
    reviews: [
      r('Valeria S.', 5, 'Recuperó todos mis archivos.', '2026-10-22'),
      r('Héctor A.', 5, 'Mi laptop quedó como nueva.', '2026-10-01'),
    ],
  },
  {
    id: 'p7', name: 'Refrigeración Torres', category: 'electrodomesticos', rate: 380, distance: 5.2,
    zone: 'Zona Oriente', schedule: 'Lun a Vie · 9:00 – 19:00', years: 14, verified: true, premium: false, active: true,
    phone: '449 555 0107',
    description: 'Reparación de refrigeradores, lavadoras, secadoras y estufas de todas las marcas.',
    services: ['Refrigeradores', 'Lavadoras', 'Secadoras', 'Estufas y hornos'],
    reviews: [
      r('Gabriela O.', 4, 'Arregló mi lavadora el mismo día.', '2026-10-17'),
      r('Iván K.', 3, 'Funcionó, pero llegó tarde.', '2026-09-30'),
    ],
  },
  {
    id: 'p8', name: 'Instalaciones Díaz', category: 'mantenimiento', rate: 330, distance: 2.8,
    zone: 'Zona Norte', schedule: 'Lun a Sáb · 8:00 – 18:00', years: 9, verified: true, premium: false, active: true,
    phone: '449 555 0108',
    description: 'Instalación de minisplits, calentadores solares, cortinas, repisas y mantenimiento general.',
    services: ['Instalación de minisplit', 'Calentador solar', 'Pintura', 'Mantenimiento general'],
    reviews: [r('Mónica E.', 5, 'Instaló el minisplit muy limpio.', '2026-10-12')],
  },
  {
    id: 'p9', name: 'Pedro Castillo', category: 'plomeria', rate: 280, distance: 3.6,
    zone: 'Zona Sur', schedule: 'Lun a Dom · 8:00 – 20:00', years: 5, verified: true, premium: false, active: true,
    phone: '449 555 0109',
    description: 'Plomería general, instalación de muebles de baño y calentadores.',
    services: ['Muebles de baño', 'Fugas', 'Calentadores'],
    reviews: [r('Elena B.', 4, 'Buen precio y trabajo rápido.', '2026-10-08')],
  },
  {
    id: 'p10', name: 'Electro Hogar Ramírez', category: 'electricidad', rate: 350, distance: 1.5,
    zone: 'Centro', schedule: 'Lun a Sáb · 8:00 – 20:00', years: 11, verified: true, premium: false, active: true,
    phone: '449 555 0110',
    description: 'Instalaciones eléctricas, ventiladores de techo, timbres y cámaras de seguridad.',
    services: ['Ventiladores de techo', 'Cámaras de seguridad', 'Cableado', 'Timbres'],
    reviews: [
      r('Arturo J.', 5, 'Instaló 4 cámaras perfectamente.', '2026-10-19'),
      r('Karla Z.', 4, 'Muy amable.', '2026-10-03'),
    ],
  },
  {
    id: 'p13', name: 'Taller Mecánico Gómez', category: 'mecanica', rate: 450, distance: 2.0,
    zone: 'Zona Norte', schedule: 'Lun a Sáb · 8:00 – 18:00', years: 16, verified: true, premium: true, active: true,
    phone: '449 555 0113',
    description: 'Mecánico a domicilio: afinaciones, frenos, batería, diagnóstico por computadora y auxilio vial.',
    services: ['Afinación', 'Cambio de frenos', 'Cambio de batería', 'Diagnóstico por escáner'],
    reviews: [
      r('Raúl S.', 5, 'Me cambió la batería en mi cochera, muy rápido.', '2026-10-26'),
      r('Diana P.', 5, 'Diagnóstico honesto, no me cobró de más.', '2026-10-13'),
      r('Tomás V.', 4, 'Buena afinación.', '2026-09-29'),
    ],
  },
  {
    id: 'p14', name: 'Auto Servicio Luna', category: 'mecanica', rate: 380, distance: 3.9,
    zone: 'Zona Sur', schedule: 'Lun a Vie · 9:00 – 19:00', years: 7, verified: true, premium: false, active: true,
    phone: '449 555 0114',
    description: 'Cambio de aceite, suspensión y revisión general de tu auto sin que salgas de casa.',
    services: ['Cambio de aceite', 'Suspensión', 'Revisión general'],
    reviews: [r('Claudia M.', 4, 'Puntual y amable.', '2026-10-16')],
  },
  {
    id: 'p11', name: 'Brillo Total', category: 'limpieza', rate: 250, distance: 2.2,
    zone: 'Zona Oriente', schedule: 'Lun a Vie · 8:00 – 16:00', years: 4, verified: false, premium: false, active: true,
    phone: '449 555 0111',
    description: 'Servicio de limpieza para casas y oficinas pequeñas.',
    services: ['Limpieza de oficinas', 'Limpieza de ventanas'],
    reviews: [],
    documents: ['INE (frente y reverso)', 'Comprobante de domicilio'],
  },
  {
    id: 'p12', name: 'Llaves Express', category: 'cerrajeria', rate: 260, distance: 4.0,
    zone: 'Zona Poniente', schedule: 'Lun a Sáb · 9:00 – 21:00', years: 3, verified: false, premium: false, active: true,
    phone: '449 555 0112',
    description: 'Duplicado de llaves, cambio de combinación y chapas de seguridad.',
    services: ['Duplicado de llaves', 'Chapas de seguridad'],
    reviews: [],
    documents: ['INE (frente y reverso)', 'Comprobante de domicilio', 'Carta de no antecedentes'],
  },
];

const DEMO_USERS = [
  { id: 'u1', role: 'cliente', name: 'Alexis Jiménez', email: 'cliente@demo.com', password: '1234', phone: '449 555 0001', address: 'Calle Madero 120, Centro' },
  { id: 'u2', role: 'prestador', name: 'Juan Pérez Morales', email: 'prestador@demo.com', password: '1234', phone: '449 555 0101', providerId: 'p1' },
  { id: 'u3', role: 'admin', name: 'Administrador ServiCerca', email: 'admin@demo.com', password: '1234', phone: '' },
];

const DEMO_REPORTS = [
  { id: 'rep1', providerId: 'p7', author: 'Iván K.', reason: 'Impuntualidad', detail: 'Llegó 2 horas tarde sin avisar.', date: '2026-10-30', status: 'abierto' },
  { id: 'rep2', providerId: 'p9', author: 'Elena B.', reason: 'Cobro distinto al acordado', detail: 'Pidió $100 extra al terminar.', date: '2026-10-27', status: 'abierto' },
];


module.exports = { PROVIDERS, DEMO_USERS, DEMO_REPORTS };
