// =============================================================
//  CONFIGURACIÓN DE LA BASE DE DATOS MySQL
//
//  No escribas tu contraseña aquí: este archivo se sube a GitHub.
//  Pon tus datos en  backend/config.local.js  (ese archivo NO se sube).
//  Puedes copiar backend/config.local.example.js y renombrarlo.
// =============================================================
let local = {};
try {
  local = require('./config.local');
} catch (e) {
  // Sin config.local.js: se usan los valores por defecto (XAMPP: root sin contraseña)
}

module.exports = {
  host: process.env.DB_HOST || local.host || 'localhost',
  port: Number(process.env.DB_PORT || local.port || 3306),
  user: process.env.DB_USER || local.user || 'root',
  password: process.env.DB_PASSWORD ?? local.password ?? '',
  database: process.env.DB_NAME || local.database || 'servicerca',

  // Puerto del servidor independiente (npm run api) para pruebas con Postman.
  apiPort: Number(process.env.API_PORT || local.apiPort || 3000),
};
