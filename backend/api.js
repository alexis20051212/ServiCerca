// API REST de ServiCerca (Express + MySQL)
const crypto = require('crypto');
const express = require('express');
const { getPool, hashPassword, checkPassword, resetDatabase } = require('./db');

const COMMISSION = 0.1;
const uid = (p) => `${p}_${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`;
const q = async (sql, params) => (await (await getPool()).query(sql, params))[0];
const one = async (sql, params) => (await q(sql, params))[0] || null;
const short = (dt) => (dt ? String(dt).slice(0, 16) : '');

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const fail = (status, message) => { throw new HttpError(status, message); };

/* ----------------------------- utilidades ----------------------------- */
async function notify(usuarioId, titulo, cuerpo, solicitudId = null) {
  if (!usuarioId) return;
  await q('INSERT INTO notificaciones (usuario_id, titulo, cuerpo, solicitud_id) VALUES (?,?,?,?)', [usuarioId, titulo, cuerpo, solicitudId]);
}

async function setStatus(id, estado, extra = {}) {
  const sets = ['estado = ?'];
  const vals = [estado];
  if (extra.fecha) { sets.push('fecha = ?'); vals.push(extra.fecha); }
  if (extra.hora) { sets.push('hora = ?'); vals.push(extra.hora); }
  if (extra.calificacion) { sets.push('calificacion_cliente = ?'); vals.push(extra.calificacion); }
  vals.push(id);
  await q(`UPDATE solicitudes SET ${sets.join(', ')} WHERE id = ?`, vals);
  await q('INSERT INTO solicitud_historial (solicitud_id, estado) VALUES (?, ?)', [id, estado]);
}

const timers = new Set();
function later(fn, ms) {
  const t = setTimeout(async () => {
    timers.delete(t);
    try { await fn(); } catch (e) { console.warn('[ServiCerca] simulación:', e.message); }
  }, ms);
  timers.add(t);
}

// Prestadores sin cuenta en la app se simulan automáticamente (modo demostración)
function simulateProvider(req, prov) {
  const first = prov.nombre.split(' ')[0];
  const still = async (estado) => { const r = await one('SELECT estado FROM solicitudes WHERE id = ?', [req.id]); return r && r.estado === estado; };
  later(async () => {
    if (!(await still('pendiente'))) return;
    await setStatus(req.id, 'aceptada');
    await notify(req.cliente_id, 'Solicitud aceptada', `${prov.nombre} aceptó tu solicitud de ${req.servicio}.`, req.id);
    await q('INSERT INTO mensajes (cliente_id, prestador_id, remitente, texto) VALUES (?,?,?,?)', [req.cliente_id, prov.id, 'provider',
      `¡Hola! Soy ${first}. Recibí tu solicitud, con gusto te atiendo el ${req.fecha} a las ${req.hora}.`]);
  }, 3500);
  later(async () => {
    if (!(await still('aceptada'))) return;
    await setStatus(req.id, 'en_camino');
    await notify(req.cliente_id, 'Prestador en camino', `${prov.nombre} va en camino a tu domicilio.`, req.id);
  }, 10000);
  later(async () => {
    if (!(await still('en_camino'))) return;
    await setStatus(req.id, 'en_proceso');
    await notify(req.cliente_id, 'Trabajo en proceso', `${prov.nombre} comenzó el trabajo.`, req.id);
  }, 16000);
  later(async () => {
    if (!(await still('en_proceso'))) return;
    await setStatus(req.id, 'completada');
    await notify(req.cliente_id, 'Trabajo terminado', `Tu servicio está listo. Realiza el pago y califica a ${first}.`, req.id);
  }, 23000);
}

/* ----------------------------- estado para la app ----------------------------- */
async function buildState(me) {
  const isAdmin = me.rol === 'admin';
  const myProv = me.rol === 'prestador' ? await one('SELECT id FROM prestadores WHERE usuario_id = ?', [me.id]) : null;

  const clientScores = await q('SELECT cliente_id, AVG(calificacion) AS prom, COUNT(*) AS n FROM resenas_clientes GROUP BY cliente_id');
  const users = (await q('SELECT u.*, p.id AS prestador_id FROM usuarios u LEFT JOIN prestadores p ON p.usuario_id = u.id')).map((u) => {
    const sc = clientScores.find((x) => x.cliente_id === u.id);
    const base = {
      id: u.id, role: u.rol, name: u.nombre, providerId: u.prestador_id || undefined,
      clientRating: sc ? Number(sc.prom) : 0, clientReviews: sc ? Number(sc.n) : 0,
    };
    if (u.id === me.id || isAdmin) Object.assign(base, { email: u.email, phone: u.telefono, address: u.direccion, acceptedTermsAt: short(u.acepto_terminos_en) });
    return base;
  });

  const provRows = await q('SELECT * FROM prestadores');
  const services = await q('SELECT prestador_id, nombre FROM prestador_servicios ORDER BY id');
  const docs = await q('SELECT prestador_id, nombre FROM prestador_documentos ORDER BY id');
  const reviews = await q('SELECT * FROM resenas ORDER BY fecha DESC, id DESC');
  const providers = provRows.map((p) => ({
    id: p.id, userId: p.usuario_id || undefined, name: p.nombre, category: p.categoria_id, rate: Number(p.tarifa),
    distance: Number(p.distancia_km), zone: p.zona, schedule: p.horario, years: p.anios_experiencia,
    verified: !!p.verificado, rejected: !!p.rechazado, active: !!p.activo, premium: !!p.premium,
    premiumPlan: p.plan_premium, premiumSince: p.premium_desde, phone: p.telefono, description: p.descripcion || '',
    services: services.filter((s) => s.prestador_id === p.id).map((s) => s.nombre),
    documents: isAdmin || (myProv && myProv.id === p.id) ? docs.filter((d) => d.prestador_id === p.id).map((d) => d.nombre) : undefined,
    reviews: reviews.filter((r) => r.prestador_id === p.id).map((r) => ({ author: r.autor, rating: r.calificacion, text: r.comentario || '', date: r.fecha })),
  }));

  let reqSql = 'SELECT s.*, u.nombre AS cliente_nombre FROM solicitudes s JOIN usuarios u ON u.id = s.cliente_id';
  const reqParams = [];
  if (me.rol === 'cliente') { reqSql += ' WHERE s.cliente_id = ?'; reqParams.push(me.id); }
  if (me.rol === 'prestador') { reqSql += ' WHERE s.prestador_id = ?'; reqParams.push(myProv ? myProv.id : '-'); }
  reqSql += ' ORDER BY s.creada_en DESC';
  const reqRows = await q(reqSql, reqParams);
  const ids = reqRows.map((r) => r.id);
  const hist = ids.length ? await q('SELECT * FROM solicitud_historial WHERE solicitud_id IN (?) ORDER BY id', [ids]) : [];
  const pays = ids.length ? await q('SELECT * FROM pagos WHERE solicitud_id IN (?)', [ids]) : [];
  const crev = ids.length ? await q('SELECT * FROM resenas_clientes WHERE solicitud_id IN (?)', [ids]) : [];
  const requests = reqRows.map((r) => {
    const pay = pays.find((x) => x.solicitud_id === r.id);
    const cr = crev.find((x) => x.solicitud_id === r.id);
    return {
      id: r.id, clientId: r.cliente_id, clientName: r.cliente_nombre, providerId: r.prestador_id, service: r.servicio,
      description: r.descripcion, date: r.fecha, time: r.hora, address: r.direccion, price: Number(r.precio), status: r.estado,
      createdAt: String(r.creada_en).slice(0, 10), myRating: r.calificacion_cliente || undefined,
      history: hist.filter((h) => h.solicitud_id === r.id).map((h) => ({ status: h.estado, at: short(h.fecha_hora) })),
      payment: pay ? {
        method: pay.metodo, total: Number(pay.total), commission: Number(pay.comision), paidAt: String(pay.pagado_en).slice(0, 10),
        folio: pay.folio_cfdi, cash: pay.metodo === 'Efectivo', pending: pay.estado === 'pendiente',
      } : undefined,
      providerRating: cr ? { rating: cr.calificacion, comment: cr.comentario || '' } : undefined,
    };
  });

  let msgRows = [];
  if (me.rol === 'cliente') msgRows = await q('SELECT * FROM mensajes WHERE cliente_id = ? ORDER BY id', [me.id]);
  if (me.rol === 'prestador' && myProv) msgRows = await q('SELECT * FROM mensajes WHERE prestador_id = ? ORDER BY id', [myProv.id]);
  const messages = {};
  for (const m of msgRows) {
    const k = `${m.cliente_id}__${m.prestador_id}`;
    (messages[k] = messages[k] || []).push({ id: `m${m.id}`, from: m.remitente, text: m.texto, at: String(m.enviado_en).slice(11, 16) });
  }

  const notifications = (await q('SELECT * FROM notificaciones WHERE usuario_id = ? ORDER BY id DESC LIMIT 100', [me.id])).map((n) => ({
    id: `n${n.id}`, userId: n.usuario_id, title: n.titulo, body: n.cuerpo, requestId: n.solicitud_id || undefined, read: !!n.leida, at: short(n.creada_en),
  }));

  const reports = isAdmin
    ? (await q('SELECT * FROM reportes ORDER BY fecha DESC')).map((r) => ({
        id: r.id, providerId: r.prestador_id, author: r.autor, reason: r.motivo, detail: r.detalle, date: r.fecha, status: r.estado, resolution: r.resolucion,
      }))
    : [];

  const ticketRows = isAdmin
    ? await q('SELECT t.*, u.nombre, u.email, u.rol FROM tickets_soporte t LEFT JOIN usuarios u ON u.id = t.usuario_id ORDER BY t.creado_en DESC')
    : await q('SELECT t.*, NULL AS nombre, NULL AS email, NULL AS rol FROM tickets_soporte t WHERE t.usuario_id = ? ORDER BY t.creado_en DESC', [me.id]);
  const tickets = ticketRows.map((t) => ({
    id: t.id, userId: t.usuario_id, userName: t.nombre || 'Usuario eliminado', userEmail: t.email, userRole: t.rol,
    message: t.mensaje, status: t.estado, reply: t.respuesta, repliedAt: short(t.respondido_en), at: short(t.creado_en),
  }));

  return { meId: me.id, users, providers, requests, messages, notifications, reports, tickets };
}

/* ----------------------------- rutas ----------------------------- */
const router = express.Router();
router.use(express.json());

const wrap = (fn) => (req, res) =>
  Promise.resolve(fn(req, res)).catch((e) => {
    if (e instanceof HttpError) return res.status(e.status).json({ error: e.message });
    const dbDown = ['ECONNREFUSED', 'ER_ACCESS_DENIED_ERROR', 'ENOTFOUND', 'ETIMEDOUT', 'ER_BAD_DB_ERROR'].includes(e.code);
    console.error('[ServiCerca] Error:', e.code || '', e.message);
    res.status(dbDown ? 503 : 500).json({
      error: dbDown
        ? `No se pudo conectar a MySQL (${e.code}). Verifica que MySQL esté encendido y revisa backend/config.js.`
        : `Error del servidor: ${e.message}`,
      db: dbDown,
    });
  });

async function auth(req) {
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) fail(401, 'Sesión no válida.');
  const u = await one('SELECT u.* FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id WHERE s.token = ?', [token]);
  if (!u) fail(401, 'Tu sesión expiró. Inicia sesión de nuevo.');
  return u;
}
const needAdmin = (u) => { if (u.rol !== 'admin') fail(403, 'Solo el administrador puede hacer esto.'); };
async function myProvider(u) {
  const p = await one('SELECT * FROM prestadores WHERE usuario_id = ?', [u.id]);
  if (!p) fail(403, 'No eres prestador.');
  return p;
}
async function newSession(userId) {
  const token = crypto.randomBytes(24).toString('hex');
  await q('INSERT INTO sesiones (token, usuario_id) VALUES (?, ?)', [token, userId]);
  return token;
}

router.get('/health', wrap(async (req, res) => {
  await getPool();
  const [{ n }] = await q('SELECT COUNT(*) AS n FROM usuarios');
  res.json({ ok: true, database: 'mysql', usuarios: n });
}));

router.post('/login', wrap(async (req, res) => {
  const { email = '', password = '' } = req.body || {};
  const u = await one('SELECT * FROM usuarios WHERE email = ?', [String(email).trim().toLowerCase()]);
  if (!u || !checkPassword(password, u.password_hash)) fail(400, 'Correo o contraseña incorrectos.');
  res.json({ token: await newSession(u.id), userId: u.id });
}));

router.post('/register', wrap(async (req, res) => {
  const d = req.body || {};
  const email = String(d.email || '').trim().toLowerCase();
  if (!d.name || !email || !d.password) fail(400, 'Faltan datos obligatorios.');
  if (await one('SELECT id FROM usuarios WHERE email = ?', [email])) fail(400, 'Ya existe una cuenta con ese correo.');
  const role = d.role === 'prestador' ? 'prestador' : 'cliente';
  const userId = uid('u');
  await q('INSERT INTO usuarios (id, rol, nombre, email, password_hash, telefono, acepto_terminos_en) VALUES (?,?,?,?,?,?,NOW())',
    [userId, role, String(d.name).trim(), email, hashPassword(d.password), String(d.phone || '').trim()]);
  if (role === 'prestador') {
    const pid = uid('p');
    await q(`INSERT INTO prestadores (id, usuario_id, nombre, categoria_id, tarifa, distancia_km, zona, horario, anios_experiencia, telefono, descripcion)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`, [pid, userId, String(d.name).trim(), d.category || 'plomeria', Number(d.rate) || 250,
      1 + Math.round(Math.random() * 40) / 10, d.zone || 'Centro', 'Lun a Vie · 9:00 – 18:00', Number(d.years) || 1,
      String(d.phone || '').trim(), 'Nuevo prestador en ServiCerca.']);
    for (const doc of ['INE (frente y reverso)', 'Comprobante de domicilio'])
      await q('INSERT INTO prestador_documentos (prestador_id, nombre) VALUES (?, ?)', [pid, doc]);
  }
  await notify(userId, '¡Bienvenido a ServiCerca!', role === 'prestador'
    ? 'Tu perfil está en revisión. Te avisaremos cuando sea verificado.'
    : 'Ya puedes buscar prestadores de servicios cerca de ti.');
  res.json({ token: await newSession(userId), userId });
}));

router.post('/logout', wrap(async (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  await q('DELETE FROM sesiones WHERE token = ?', [token]);
  res.json({ ok: true });
}));

router.get('/state', wrap(async (req, res) => {
  const me = await auth(req);
  res.json(await buildState(me));
}));

router.patch('/me', wrap(async (req, res) => {
  const me = await auth(req);
  const { name, phone, address } = req.body || {};
  await q('UPDATE usuarios SET nombre = COALESCE(?, nombre), telefono = COALESCE(?, telefono), direccion = COALESCE(?, direccion) WHERE id = ?',
    [name ?? null, phone ?? null, address ?? null, me.id]);
  if (name && me.rol === 'prestador') await q('UPDATE prestadores SET nombre = ? WHERE usuario_id = ?', [name, me.id]);
  res.json({ ok: true });
}));

router.delete('/me', wrap(async (req, res) => {
  const me = await auth(req);
  if (me.rol === 'admin') fail(400, 'La cuenta de administrador no se puede eliminar.');
  await q('DELETE FROM usuarios WHERE id = ?', [me.id]); // ON DELETE CASCADE borra prestador, sesiones, etc.
  res.json({ ok: true });
}));

router.patch('/providers/:id', wrap(async (req, res) => {
  const me = await auth(req);
  const p = await one('SELECT * FROM prestadores WHERE id = ?', [req.params.id]);
  if (!p) fail(404, 'Prestador no encontrado.');
  if (p.usuario_id !== me.id && me.rol !== 'admin') fail(403, 'No puedes editar este perfil.');
  const b = req.body || {};
  const map = { description: 'descripcion', rate: 'tarifa', schedule: 'horario', zone: 'zona', category: 'categoria_id', years: 'anios_experiencia', active: 'activo' };
  const sets = []; const vals = [];
  for (const [k, col] of Object.entries(map)) if (b[k] !== undefined) { sets.push(`${col} = ?`); vals.push(k === 'active' ? (b[k] ? 1 : 0) : b[k]); }
  if (sets.length) await q(`UPDATE prestadores SET ${sets.join(', ')} WHERE id = ?`, [...vals, p.id]);
  if (Array.isArray(b.services)) {
    await q('DELETE FROM prestador_servicios WHERE prestador_id = ?', [p.id]);
    for (const s of b.services) await q('INSERT INTO prestador_servicios (prestador_id, nombre) VALUES (?, ?)', [p.id, String(s).slice(0, 120)]);
  }
  res.json({ ok: true });
}));

router.post('/requests', wrap(async (req, res) => {
  const me = await auth(req);
  if (me.rol !== 'cliente') fail(403, 'Solo los clientes pueden solicitar servicios.');
  const b = req.body || {};
  const prov = await one('SELECT * FROM prestadores WHERE id = ? AND verificado = 1 AND activo = 1', [b.providerId]);
  if (!prov) fail(400, 'El prestador no está disponible.');
  const id = uid('req');
  await q(`INSERT INTO solicitudes (id, cliente_id, prestador_id, servicio, descripcion, fecha, hora, direccion, precio)
    VALUES (?,?,?,?,?,?,?,?,?)`, [id, me.id, prov.id, b.service, b.description, b.date, b.time, b.address, prov.tarifa]);
  await q('INSERT INTO solicitud_historial (solicitud_id, estado) VALUES (?, ?)', [id, 'pendiente']);
  if (!me.direccion && b.address) await q('UPDATE usuarios SET direccion = ? WHERE id = ?', [b.address, me.id]);
  if (prov.usuario_id) await notify(prov.usuario_id, 'Nueva solicitud', `${me.nombre} solicita: ${b.service}.`, id);
  else simulateProvider({ id, cliente_id: me.id, servicio: b.service, fecha: b.date, hora: b.time }, prov);
  res.json({ id });
}));

const PROVIDER_MOVES = {
  aceptada: ['pendiente', 'reprogramada'], rechazada: ['pendiente'], reprogramada: ['pendiente'],
  en_camino: ['aceptada'], en_proceso: ['en_camino'], completada: ['en_proceso'],
};
router.post('/requests/:id/status', wrap(async (req, res) => {
  const me = await auth(req);
  const r = await one('SELECT * FROM solicitudes WHERE id = ?', [req.params.id]);
  if (!r) fail(404, 'Solicitud no encontrada.');
  const prov = await one('SELECT * FROM prestadores WHERE id = ?', [r.prestador_id]);
  const { status, date, time } = req.body || {};

  if (me.rol === 'cliente' && r.cliente_id === me.id) {
    if (status === 'cancelada' && ['pendiente', 'aceptada', 'reprogramada'].includes(r.estado)) {
      await setStatus(r.id, 'cancelada');
      if (prov.usuario_id) await notify(prov.usuario_id, 'Solicitud cancelada', `${me.nombre} canceló: ${r.servicio}.`, r.id);
    } else if (status === 'aceptada' && r.estado === 'reprogramada') {
      await setStatus(r.id, 'aceptada');
      if (prov.usuario_id) await notify(prov.usuario_id, 'Nueva fecha aceptada', `${me.nombre} aceptó la nueva fecha.`, r.id);
    } else fail(400, 'Cambio de estado no permitido.');
    return res.json({ ok: true });
  }

  if (me.rol === 'prestador' && prov.usuario_id === me.id) {
    if (!PROVIDER_MOVES[status] || !PROVIDER_MOVES[status].includes(r.estado)) fail(400, 'Cambio de estado no permitido.');
    await setStatus(r.id, status, { fecha: date, hora: time });
    const t = {
      aceptada: ['Solicitud aceptada', `${prov.nombre} aceptó tu solicitud.`],
      rechazada: ['Solicitud rechazada', `${prov.nombre} no puede atender tu solicitud. Busca otro prestador.`],
      reprogramada: ['Solicitud reprogramada', `${prov.nombre} propone el ${date} a las ${time}.`],
      en_camino: ['Prestador en camino', `${prov.nombre} va en camino.`],
      en_proceso: ['Trabajo en proceso', `${prov.nombre} comenzó el trabajo.`],
      completada: ['Trabajo terminado', 'Realiza el pago y califica el servicio.'],
    }[status];
    await notify(r.cliente_id, t[0], t[1], r.id);
    return res.json({ ok: true });
  }
  fail(403, 'No puedes modificar esta solicitud.');
}));

router.post('/requests/:id/pay', wrap(async (req, res) => {
  const me = await auth(req);
  const r = await one('SELECT * FROM solicitudes WHERE id = ? AND cliente_id = ?', [req.params.id, me.id]);
  if (!r) fail(404, 'Solicitud no encontrada.');
  if (r.estado !== 'completada') fail(400, 'Esta solicitud no está lista para pagarse.');
  if (await one('SELECT id FROM pagos WHERE solicitud_id = ?', [r.id])) fail(400, 'Esta solicitud ya tiene un pago registrado.');
  const cash = String((req.body || {}).method || '').toLowerCase() === 'efectivo';
  const total = Number(r.precio);
  const comision = Math.round(total * COMMISSION * 100) / 100;
  const folio = `CFDI-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const prov = await one('SELECT * FROM prestadores WHERE id = ?', [r.prestador_id]);
  await q('INSERT INTO pagos (solicitud_id, metodo, total, comision, folio_cfdi, estado) VALUES (?,?,?,?,?,?)',
    [r.id, cash ? 'Efectivo' : String(req.body.method || 'Tarjeta').slice(0, 60), total, comision, folio, cash ? 'pendiente' : 'confirmado']);

  if (cash) {
    // El prestador debe confirmar que recibió el efectivo
    if (prov.usuario_id) {
      await notify(prov.usuario_id, 'Pago en efectivo', `${me.nombre} pagará $${total.toFixed(2)} en efectivo por ${r.servicio}. Confírmalo al recibirlo.`, r.id);
    } else {
      later(async () => confirmCash(r.id), 4000); // prestador simulado
    }
    return res.json({ ok: true, folio, pending: true });
  }

  await setStatus(r.id, 'pagada');
  if (prov.usuario_id) await notify(prov.usuario_id, 'Pago recibido', `Recibiste $${(total - comision).toFixed(2)} por ${r.servicio} (comisión descontada).`, r.id);
  res.json({ ok: true, folio });
}));

async function confirmCash(solicitudId) {
  const pay = await one("SELECT * FROM pagos WHERE solicitud_id = ? AND estado = 'pendiente'", [solicitudId]);
  if (!pay) return false;
  await q("UPDATE pagos SET estado = 'confirmado', pagado_en = NOW() WHERE id = ?", [pay.id]);
  await setStatus(solicitudId, 'pagada');
  const r = await one('SELECT * FROM solicitudes WHERE id = ?', [solicitudId]);
  await notify(r.cliente_id, 'Pago en efectivo confirmado', `El prestador confirmó tu pago de $${Number(pay.total).toFixed(2)}. ¡Califica el servicio!`, solicitudId);
  return true;
}

router.post('/requests/:id/confirm-cash', wrap(async (req, res) => {
  const me = await auth(req);
  const p = await myProvider(me);
  const r = await one('SELECT * FROM solicitudes WHERE id = ? AND prestador_id = ?', [req.params.id, p.id]);
  if (!r) fail(404, 'Solicitud no encontrada.');
  if (!(await confirmCash(r.id))) fail(400, 'No hay un pago en efectivo pendiente.');
  res.json({ ok: true });
}));

// El prestador califica al cliente
router.post('/requests/:id/rate-client', wrap(async (req, res) => {
  const me = await auth(req);
  const p = await myProvider(me);
  const r = await one('SELECT * FROM solicitudes WHERE id = ? AND prestador_id = ?', [req.params.id, p.id]);
  if (!r) fail(404, 'Solicitud no encontrada.');
  if (!['pagada', 'calificada'].includes(r.estado)) fail(400, 'Solo puedes calificar al cliente cuando el servicio está pagado.');
  if (await one('SELECT id FROM resenas_clientes WHERE solicitud_id = ?', [r.id])) fail(400, 'Ya calificaste a este cliente.');
  const rating = Math.max(1, Math.min(5, Number(req.body.rating) || 5));
  await q('INSERT INTO resenas_clientes (cliente_id, prestador_id, solicitud_id, calificacion, comentario, fecha) VALUES (?,?,?,?,?,CURDATE())',
    [r.cliente_id, p.id, r.id, rating, String(req.body.comment || '')]);
  await notify(r.cliente_id, 'Te calificaron', `${p.nombre} te calificó con ${rating} estrellas como cliente.`, r.id);
  res.json({ ok: true });
}));

router.post('/requests/:id/rate', wrap(async (req, res) => {
  const me = await auth(req);
  const r = await one('SELECT * FROM solicitudes WHERE id = ? AND cliente_id = ?', [req.params.id, me.id]);
  if (!r) fail(404, 'Solicitud no encontrada.');
  if (r.estado !== 'pagada') fail(400, 'Solo puedes calificar servicios pagados.');
  const rating = Math.max(1, Math.min(5, Number(req.body.rating) || 5));
  const parts = me.nombre.split(' ');
  const author = parts[0] + (parts[1] ? ` ${parts[1][0]}.` : '');
  await q('INSERT INTO resenas (prestador_id, solicitud_id, autor, calificacion, comentario, fecha) VALUES (?,?,?,?,?,CURDATE())',
    [r.prestador_id, r.id, author, rating, String(req.body.comment || '')]);
  await setStatus(r.id, 'calificada', { calificacion: rating });
  const prov = await one('SELECT * FROM prestadores WHERE id = ?', [r.prestador_id]);
  if (prov.usuario_id) await notify(prov.usuario_id, 'Nueva reseña', `${author} te calificó con ${rating} estrellas.`, r.id);
  res.json({ ok: true });
}));

const REPLIES = ['Perfecto, quedo atento.', 'Claro, llevo todo el material necesario.', 'Gracias por el mensaje, en un momento le confirmo.', 'De acuerdo, nos vemos a la hora acordada.'];
router.post('/messages', wrap(async (req, res) => {
  const me = await auth(req);
  const { clientId, providerId, text } = req.body || {};
  if (!text || !String(text).trim()) fail(400, 'Mensaje vacío.');
  const prov = await one('SELECT * FROM prestadores WHERE id = ?', [providerId]);
  if (!prov) fail(404, 'Prestador no encontrado.');
  let from;
  if (me.rol === 'cliente' && clientId === me.id) from = 'client';
  else if (me.rol === 'prestador' && prov.usuario_id === me.id) from = 'provider';
  else fail(403, 'No participas en esta conversación.');
  await q('INSERT INTO mensajes (cliente_id, prestador_id, remitente, texto) VALUES (?,?,?,?)', [clientId, providerId, from, String(text).trim()]);
  if (from === 'client') {
    if (prov.usuario_id) await notify(prov.usuario_id, `Mensaje de ${me.nombre}`, String(text).trim());
    else later(async () => {
      await q('INSERT INTO mensajes (cliente_id, prestador_id, remitente, texto) VALUES (?,?,?,?)', [clientId, providerId, 'provider', REPLIES[Math.floor(Math.random() * REPLIES.length)]]);
      await notify(clientId, `Mensaje de ${prov.nombre}`, 'Tienes un nuevo mensaje.');
    }, 2500);
  } else {
    await notify(clientId, `Mensaje de ${prov.nombre}`, String(text).trim());
  }
  res.json({ ok: true });
}));

router.post('/notifications/read', wrap(async (req, res) => {
  const me = await auth(req);
  await q('UPDATE notificaciones SET leida = 1 WHERE usuario_id = ?', [me.id]);
  res.json({ ok: true });
}));

router.post('/reports', wrap(async (req, res) => {
  const me = await auth(req);
  const { providerId, reason, detail } = req.body || {};
  if (!reason) fail(400, 'Selecciona un motivo.');
  await q('INSERT INTO reportes (id, prestador_id, autor, motivo, detalle, fecha) VALUES (?,?,?,?,?,CURDATE())', [uid('rep'), providerId, me.nombre, reason, detail || '']);
  res.json({ ok: true });
}));

router.post('/reports/:id/resolve', wrap(async (req, res) => {
  needAdmin(await auth(req));
  await q("UPDATE reportes SET estado = 'resuelto', resolucion = ? WHERE id = ?", [req.body.resolution || 'Resuelto', req.params.id]);
  res.json({ ok: true });
}));

router.post('/providers/:id/verify', wrap(async (req, res) => {
  needAdmin(await auth(req));
  const approve = !!(req.body || {}).approve;
  await q('UPDATE prestadores SET verificado = ?, rechazado = ? WHERE id = ?', [approve ? 1 : 0, approve ? 0 : 1, req.params.id]);
  const p = await one('SELECT * FROM prestadores WHERE id = ?', [req.params.id]);
  if (p && p.usuario_id) await notify(p.usuario_id, approve ? 'Perfil verificado' : 'Verificación rechazada',
    approve ? 'Tu perfil ya es visible para los clientes.' : 'Revisa tus documentos y vuelve a enviarlos.');
  res.json({ ok: true });
}));

router.post('/providers/:id/suspend', wrap(async (req, res) => {
  needAdmin(await auth(req));
  await q('UPDATE prestadores SET activo = 1 - activo WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
}));

router.post('/premium', wrap(async (req, res) => {
  const p = await myProvider(await auth(req));
  await q('UPDATE prestadores SET premium = 1, plan_premium = ?, premium_desde = CURDATE() WHERE id = ?', [req.body.plan || 'mensual', p.id]);
  res.json({ ok: true });
}));

router.delete('/premium', wrap(async (req, res) => {
  const p = await myProvider(await auth(req));
  await q('UPDATE prestadores SET premium = 0, plan_premium = NULL, premium_desde = NULL WHERE id = ?', [p.id]);
  res.json({ ok: true });
}));

router.post('/support', wrap(async (req, res) => {
  const me = await auth(req);
  const msg = String((req.body || {}).message || '').trim();
  if (msg.length < 5) fail(400, 'Describe tu problema con más detalle.');
  await q('INSERT INTO tickets_soporte (usuario_id, mensaje) VALUES (?, ?)', [me.id, msg]);
  const admins = await q("SELECT id FROM usuarios WHERE rol = 'admin'");
  for (const a of admins) await notify(a.id, 'Nuevo ticket de soporte', `${me.nombre}: ${msg.slice(0, 80)}`);
  res.json({ ok: true });
}));

// El administrador responde y cierra un ticket
router.post('/support/:id/reply', wrap(async (req, res) => {
  needAdmin(await auth(req));
  const reply = String((req.body || {}).reply || '').trim();
  const t = await one('SELECT * FROM tickets_soporte WHERE id = ?', [req.params.id]);
  if (!t) fail(404, 'Ticket no encontrado.');
  await q("UPDATE tickets_soporte SET estado = 'resuelto', respuesta = ?, respondido_en = NOW() WHERE id = ?", [reply || null, t.id]);
  if (t.usuario_id) await notify(t.usuario_id, 'Soporte respondió tu ticket', reply ? reply.slice(0, 200) : 'Tu ticket fue marcado como resuelto.');
  res.json({ ok: true });
}));

router.post('/support/:id/reopen', wrap(async (req, res) => {
  needAdmin(await auth(req));
  await q("UPDATE tickets_soporte SET estado = 'abierto' WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
}));

router.post('/reset', wrap(async (req, res) => {
  timers.forEach(clearTimeout); timers.clear();
  await resetDatabase();
  res.json({ ok: true });
}));

router.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Aplicación Express que atiende /api/*
const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use('/api', router);

// Conectar a MySQL al iniciar (muestra el error en la terminal si falla)
getPool().catch((e) => console.error(`[ServiCerca] No se pudo conectar a MySQL: ${e.code || ''} ${e.message}\n  Revisa que MySQL esté encendido y los datos de backend/config.js`));

module.exports = app;
