// Servidor API independiente (opcional): npm run api
// Útil para probar los endpoints con Postman en http://localhost:3000/api/health
const app = require('./api');
const { apiPort } = require('./config');

app.listen(apiPort, () => console.log(`[ServiCerca] API escuchando en http://localhost:${apiPort}/api`));
