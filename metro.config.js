// Configuración de Metro: además de servir la app, atiende la API (/api/*)
// en el mismo puerto. Así el celular llega a la API aunque uses --tunnel.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
let api = null;
let loadError = null;

function loadApi() {
  if (api || loadError) return api;
  try {
    api = require('./backend/api');
  } catch (e) {
    loadError = e;
    const missing = (e.message.match(/Cannot find module '([^']+)'/) || [])[1];
    console.error(
      missing
        ? `\n[ServiCerca] Falta la librería "${missing}". Detén Expo (Ctrl + C) y ejecuta:  npm.cmd install\n`
        : `\n[ServiCerca] No se pudo cargar la API: ${e.message}\n`
    );
  }
  return api;
}

config.server = {
  ...config.server,
  enhanceMiddleware: (metroMiddleware) => (req, res, next) => {
    if (req.url && req.url.startsWith('/api/')) {
      const handler = loadApi();
      if (!handler) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'Faltan librerías del servidor. En la computadora ejecuta: npm.cmd install' }));
      }
      return handler(req, res, next);
    }
    return metroMiddleware(req, res, next);
  },
};

module.exports = config;
