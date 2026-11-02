// Conexión a MySQL, creación automática de tablas y datos iniciales.
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const config = require('./config');
const { PROVIDERS, DEMO_USERS, DEMO_REPORTS } = require('../src/demoData');

const CATEGORIES = [
  ['plomeria', 'Plomería', 'Fontanero'],
  ['electricidad', 'Electricidad', 'Electricista'],
  ['mecanica', 'Mecánica', 'Mecánico'],
  ['cerrajeria', 'Cerrajería', 'Cerrajero'],
  ['limpieza', 'Limpieza', 'Encargado de limpieza'],
  ['jardineria', 'Jardinería', 'Jardinero'],
  ['computadoras', 'Computadoras', 'Técnico en cómputo'],
  ['electrodomesticos', 'Electrodomésticos', 'Técnico en línea blanca'],
  ['mantenimiento', 'Instalación y mantenimiento', 'Técnico de mantenimiento'],
];

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS categorias (
    id VARCHAR(40) PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    rol VARCHAR(80) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(40) PRIMARY KEY,
    rol ENUM('cliente','prestador','admin') NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(200) NOT NULL,
    telefono VARCHAR(30) DEFAULT '',
    direccion VARCHAR(200) DEFAULT '',
    acepto_terminos_en DATETIME NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS sesiones (
    token VARCHAR(80) PRIMARY KEY,
    usuario_id VARCHAR(40) NOT NULL,
    creada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS prestadores (
    id VARCHAR(40) PRIMARY KEY,
    usuario_id VARCHAR(40) NULL UNIQUE,
    nombre VARCHAR(120) NOT NULL,
    categoria_id VARCHAR(40) NOT NULL,
    tarifa DECIMAL(10,2) NOT NULL,
    distancia_km DECIMAL(5,1) NOT NULL DEFAULT 1.0,
    zona VARCHAR(60) NOT NULL,
    horario VARCHAR(80) NOT NULL,
    anios_experiencia INT NOT NULL DEFAULT 1,
    verificado TINYINT(1) NOT NULL DEFAULT 0,
    rechazado TINYINT(1) NOT NULL DEFAULT 0,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    premium TINYINT(1) NOT NULL DEFAULT 0,
    plan_premium VARCHAR(20) NULL,
    premium_desde DATE NULL,
    telefono VARCHAR(30) DEFAULT '',
    descripcion TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS prestador_servicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prestador_id VARCHAR(40) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    FOREIGN KEY (prestador_id) REFERENCES prestadores(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS prestador_documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prestador_id VARCHAR(40) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    FOREIGN KEY (prestador_id) REFERENCES prestadores(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS solicitudes (
    id VARCHAR(40) PRIMARY KEY,
    cliente_id VARCHAR(40) NOT NULL,
    prestador_id VARCHAR(40) NOT NULL,
    servicio VARCHAR(120) NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    hora VARCHAR(5) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    estado ENUM('pendiente','aceptada','reprogramada','en_camino','en_proceso','completada','pagada','calificada','rechazada','cancelada') NOT NULL DEFAULT 'pendiente',
    calificacion_cliente TINYINT NULL,
    creada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (prestador_id) REFERENCES prestadores(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS solicitud_historial (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id VARCHAR(40) NOT NULL,
    estado VARCHAR(20) NOT NULL,
    fecha_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id VARCHAR(40) NOT NULL UNIQUE,
    metodo VARCHAR(60) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    comision DECIMAL(10,2) NOT NULL,
    folio_cfdi VARCHAR(40) NOT NULL,
    estado ENUM('confirmado','pendiente') NOT NULL DEFAULT 'confirmado',
    pagado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS resenas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prestador_id VARCHAR(40) NOT NULL,
    solicitud_id VARCHAR(40) NULL,
    autor VARCHAR(80) NOT NULL,
    calificacion TINYINT NOT NULL,
    comentario TEXT,
    fecha DATE NOT NULL,
    FOREIGN KEY (prestador_id) REFERENCES prestadores(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS resenas_clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id VARCHAR(40) NOT NULL,
    prestador_id VARCHAR(40) NOT NULL,
    solicitud_id VARCHAR(40) NOT NULL UNIQUE,
    calificacion TINYINT NOT NULL,
    comentario TEXT,
    fecha DATE NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (prestador_id) REFERENCES prestadores(id) ON DELETE CASCADE,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id VARCHAR(40) NOT NULL,
    prestador_id VARCHAR(40) NOT NULL,
    remitente ENUM('client','provider') NOT NULL,
    texto TEXT NOT NULL,
    enviado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (prestador_id) REFERENCES prestadores(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id VARCHAR(40) NOT NULL,
    titulo VARCHAR(120) NOT NULL,
    cuerpo VARCHAR(300) NOT NULL,
    solicitud_id VARCHAR(40) NULL,
    leida TINYINT(1) NOT NULL DEFAULT 0,
    creada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS reportes (
    id VARCHAR(40) PRIMARY KEY,
    prestador_id VARCHAR(40) NOT NULL,
    autor VARCHAR(120) NOT NULL,
    motivo VARCHAR(120) NOT NULL,
    detalle TEXT,
    fecha DATE NOT NULL,
    estado ENUM('abierto','resuelto') NOT NULL DEFAULT 'abierto',
    resolucion VARCHAR(200) NULL,
    FOREIGN KEY (prestador_id) REFERENCES prestadores(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS tickets_soporte (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id VARCHAR(40) NULL,
    mensaje TEXT NOT NULL,
    estado ENUM('abierto','resuelto') NOT NULL DEFAULT 'abierto',
    respuesta TEXT NULL,
    respondido_en DATETIME NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

const TABLES_DROP_ORDER = [
  'tickets_soporte', 'reportes', 'notificaciones', 'mensajes', 'resenas_clientes', 'resenas', 'pagos', 'solicitud_historial',
  'solicitudes', 'prestador_documentos', 'prestador_servicios', 'prestadores', 'sesiones', 'usuarios', 'categorias',
];

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function checkPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(String(password), salt, 64);
  return crypto.timingSafeEqual(test, Buffer.from(hash, 'hex'));
}

let pool = null;
let initPromise = null;

async function getPool() {
  if (!initPromise) {
    initPromise = (async () => {
      // 1) Crear la base de datos si no existe
      const conn = await mysql.createConnection({
        host: config.host, port: config.port, user: config.user, password: config.password,
      });
      await conn.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await conn.end();
      // 2) Pool de conexiones
      pool = mysql.createPool({
        host: config.host, port: config.port, user: config.user, password: config.password,
        database: config.database, waitForConnections: true, connectionLimit: 10, dateStrings: true, charset: 'utf8mb4',
      });
      // 3) Tablas y datos iniciales
      await createTables();
      await migrate();
      const [[{ n }]] = await pool.query('SELECT COUNT(*) AS n FROM usuarios');
      if (n === 0) await seed();
      console.log(`[ServiCerca] MySQL conectado: ${config.user}@${config.host}:${config.port}/${config.database}`);
      return pool;
    })().catch((e) => {
      initPromise = null; // permite reintentar
      throw e;
    });
  }
  return initPromise;
}

// Crea las tablas usando la misma intercalación (collation) que las tablas existentes,
// para que las llaves foráneas sean compatibles aunque la base se haya creado en Workbench.
async function createTables() {
  const [rows] = await pool.query(
    "SELECT COLLATION_NAME AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'id'",
    [config.database]
  );
  const collation = (rows[0] && rows[0].c) || 'utf8mb4_unicode_ci';
  for (const sql of SCHEMA) {
    await pool.query(sql.replace('DEFAULT CHARSET=utf8mb4', `DEFAULT CHARSET=utf8mb4 COLLATE=${collation}`));
  }
}

// Actualiza bases creadas con versiones anteriores (por ejemplo, desde servicerca.sql)
async function migrate() {
  const hasCol = async (table, col) => {
    const [r] = await pool.query(
      'SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      [config.database, table, col]
    );
    return r.length > 0;
  };
  if (!(await hasCol('pagos', 'estado')))
    await pool.query("ALTER TABLE pagos ADD COLUMN estado ENUM('confirmado','pendiente') NOT NULL DEFAULT 'confirmado' AFTER folio_cfdi");
  if (!(await hasCol('tickets_soporte', 'estado')))
    await pool.query("ALTER TABLE tickets_soporte ADD COLUMN estado ENUM('abierto','resuelto') NOT NULL DEFAULT 'abierto' AFTER mensaje");
  if (!(await hasCol('tickets_soporte', 'respuesta')))
    await pool.query('ALTER TABLE tickets_soporte ADD COLUMN respuesta TEXT NULL AFTER estado, ADD COLUMN respondido_en DATETIME NULL AFTER respuesta');
}

async function seed() {
  for (const [id, nombre, rol] of CATEGORIES) {
    await pool.query('INSERT IGNORE INTO categorias (id, nombre, rol) VALUES (?, ?, ?)', [id, nombre, rol]);
  }
  for (const u of DEMO_USERS) {
    await pool.query(
      'INSERT INTO usuarios (id, rol, nombre, email, password_hash, telefono, direccion, acepto_terminos_en) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [u.id, u.role, u.name, u.email, hashPassword(u.password), u.phone || '', u.address || '']
    );
  }
  for (const p of PROVIDERS) {
    await pool.query(
      `INSERT INTO prestadores (id, usuario_id, nombre, categoria_id, tarifa, distancia_km, zona, horario, anios_experiencia,
        verificado, activo, premium, plan_premium, telefono, descripcion) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [p.id, p.userId || null, p.name, p.category, p.rate, p.distance, p.zone, p.schedule, p.years,
        p.verified ? 1 : 0, p.active ? 1 : 0, p.premium ? 1 : 0, p.premium ? 'mensual' : null, p.phone, p.description]
    );
    for (const s of p.services) await pool.query('INSERT INTO prestador_servicios (prestador_id, nombre) VALUES (?, ?)', [p.id, s]);
    for (const d of p.documents || ['INE (frente y reverso)', 'Comprobante de domicilio'])
      await pool.query('INSERT INTO prestador_documentos (prestador_id, nombre) VALUES (?, ?)', [p.id, d]);
    for (const r of p.reviews)
      await pool.query('INSERT INTO resenas (prestador_id, autor, calificacion, comentario, fecha) VALUES (?,?,?,?,?)', [p.id, r.author, r.rating, r.text, r.date]);
  }
  for (const r of DEMO_REPORTS) {
    await pool.query('INSERT INTO reportes (id, prestador_id, autor, motivo, detalle, fecha, estado) VALUES (?,?,?,?,?,?,?)',
      [r.id, r.providerId, r.author, r.reason, r.detail, r.date, r.status]);
  }
  // Una solicitud finalizada de ejemplo para el cliente demo
  await pool.query(`INSERT INTO solicitudes (id, cliente_id, prestador_id, servicio, descripcion, fecha, hora, direccion, precio, estado, calificacion_cliente)
    VALUES ('req_demo1','u1','p3','Cambio de chapas','Cambiar la chapa de la puerta principal.','2026-10-25','10:00','Calle Madero 120, Centro',300,'calificada',5)`);
  await pool.query(`INSERT INTO solicitud_historial (solicitud_id, estado, fecha_hora) VALUES ('req_demo1','calificada','2026-10-25 12:10:00')`);
  await pool.query(`INSERT INTO pagos (solicitud_id, metodo, total, comision, folio_cfdi, pagado_en) VALUES ('req_demo1','Tarjeta •••• 4242',300,30,'CFDI-DEMO-0001','2026-10-25 12:00:00')`);
}

async function resetDatabase() {
  const p = await getPool();
  await p.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const t of TABLES_DROP_ORDER) await p.query(`DROP TABLE IF EXISTS ${t}`);
  await p.query('SET FOREIGN_KEY_CHECKS = 1');
  await createTables();
  await seed();
}

module.exports = { getPool, hashPassword, checkPassword, resetDatabase };
