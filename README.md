# ServiCerca — Aplicación móvil (MVP) con base de datos MySQL

Aplicación móvil que conecta a clientes con prestadores de servicios para el hogar
(plomería, electricidad, mecánica, cerrajería, limpieza, jardinería, cómputo, línea blanca e instalaciones).

- **App móvil:** React Native + Expo (SDK 58), un solo código para Android e iOS.
- **API REST:** Node.js + Express (carpeta `backend/`).
- **Base de datos:** MySQL (también funciona con MariaDB de XAMPP).

```
Celular (Expo Go)  ──►  API /api/*  (Node + Express)  ──►  MySQL  (base "servicerca")
```

La API corre dentro del mismo servidor de Expo, así que funciona igual con Wi-Fi o con `--tunnel ngrok`.

---

## 1. Requisitos (una sola vez)
1. **Node.js 20 o superior**: https://nodejs.org
2. **MySQL**. La forma más fácil es **XAMPP** (https://www.apachefriends.org). Abre el *XAMPP Control Panel* y presiona **Start** en **MySQL**.
   - También sirve MySQL Community Server / MySQL Workbench.
3. La app **Expo Go** en tu celular.

## 2. Configurar la conexión a MySQL
Tus datos de MySQL van en `backend/config.local.js` (ese archivo **no se sube a GitHub**, así tu contraseña queda privada):

1. Copia `backend/config.local.example.js` y renómbralo a `backend/config.local.js`.
2. Escribe tu puerto, usuario y contraseña:

```js
module.exports = { host: 'localhost', port: 3306, user: 'root', password: 'TU_CONTRASEÑA', database: 'servicerca' };
```

Si no existe `config.local.js`, la app usa `root` sin contraseña en el puerto 3306 (igual que XAMPP).

**No necesitas crear la base de datos.** Al arrancar, la app crea sola la base `servicerca`, sus tablas
y los datos de demostración. Si prefieres, también puedes ejecutar `backend/servicerca.sql` en MySQL Workbench.

## 3. Ejecutar
Dentro de la carpeta del proyecto (usa una carpeta fuera de OneDrive, por ejemplo `C:\ServiCerca`):

```
npm.cmd install
npx.cmd expo start --tunnel ngrok
```

Escanea el QR con Expo Go. En la terminal debe aparecer:
`[ServiCerca] MySQL conectado: root@localhost:3306/servicerca`

También puedes usar `INICIAR.bat` (Wi-Fi) o `INICIAR-TUNEL.bat` (túnel) con doble clic.

> Si la app muestra **"Sin conexión con el servidor"**, revisa que MySQL esté encendido en XAMPP
> y que los datos de `backend/config.js` sean correctos. Luego toca **Reintentar**.

---

## Base de datos

| Tabla | Contenido |
|---|---|
| `usuarios` | Clientes, prestadores y administradores (contraseñas cifradas con *scrypt*) |
| `sesiones` | Tokens de inicio de sesión |
| `categorias` | Plomería, electricidad, mecánica… |
| `prestadores` | Perfil profesional, tarifa, zona, verificación, premium |
| `prestador_servicios` | Servicios que ofrece cada prestador |
| `prestador_documentos` | Documentos de verificación |
| `solicitudes` | Servicios solicitados y su estado |
| `solicitud_historial` | Cada cambio de estado con fecha y hora |
| `pagos` | Pagos con tarjeta, SPEI o **efectivo** (el prestador confirma el efectivo), comisión del 10 % y folio CFDI |
| `resenas` | Calificaciones que los clientes dan a los prestadores |
| `resenas_clientes` | Calificaciones que los prestadores dan a los clientes |
| `mensajes` | Chat cliente–prestador |
| `notificaciones` | Avisos para cada usuario |
| `reportes` | Quejas de clientes |
| `tickets_soporte` | Tickets del centro de ayuda, con respuesta del administrador |

- Puedes ver los datos en **phpMyAdmin**: http://localhost/phpmyadmin → base `servicerca`.
- `backend/servicerca.sql` es un respaldo de la estructura con los datos iniciales.
  **No es necesario importarlo**; sirve para revisarlo o entregarlo.
- **Reiniciar la base:** en la app, *Cuenta → Reiniciar datos de demostración*.

## API (para probar con Postman)
`npm run api` levanta la API sola en `http://localhost:3000/api`. Rutas principales:

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Prueba la conexión con MySQL |
| POST | `/api/login` · `/api/register` | Inicio de sesión / registro (devuelve token) |
| GET | `/api/state` | Datos del usuario (requiere `Authorization: Bearer <token>`) |
| POST | `/api/requests` | Crear solicitud |
| POST | `/api/requests/:id/status` | Aceptar, rechazar, reprogramar, avanzar o cancelar |
| POST | `/api/requests/:id/pay` · `/rate` | Pagar y calificar |
| POST | `/api/messages` | Enviar mensaje |
| POST | `/api/providers/:id/verify` | Verificar prestador (admin) |
| POST | `/api/reports` · `/api/reports/:id/resolve` | Reportes |
| POST / DELETE | `/api/premium` | Plan premium |

---

## Cuentas de demostración (contraseña `1234`)

| Rol | Correo |
|---|---|
| Cliente | cliente@demo.com |
| Prestador (plomero) | prestador@demo.com |
| Administrador | admin@demo.com |

Como los datos viven en MySQL, puedes abrir la app en **dos celulares** (uno como cliente y otro
como prestador) y ver los cambios en ambos en tiempo real. Los prestadores que no tienen cuenta
se simulan solos: aceptan, van en camino y terminan el trabajo en unos segundos.

## Requerimientos cubiertos

| ID | Requerimiento | Dónde está |
|---|---|---|
| RF-01 | Registro y autenticación | Crear cuenta / Iniciar sesión (tabla `usuarios`, `sesiones`) |
| RF-02 | Gestión de perfiles | Cuenta → Datos personales / Perfil profesional |
| RF-03 | Búsqueda de servicios | Pestaña Buscar: texto, categoría, distancia, calificación |
| RF-04 | Geolocalización | Activar ubicación con consentimiento |
| RF-05 | Solicitud de servicio | Perfil del prestador → Solicitar |
| RF-06 | Gestión de solicitudes | Prestador: aceptar, rechazar, reprogramar y avanzar |
| RF-07 | Mensajería | Chat (tabla `mensajes`) |
| RF-08 | Pagos | Pago con comisión del 10 % (tabla `pagos`, modo demostración) |
| RF-09 | Calificaciones | Cliente ↔ prestador, en ambos sentidos, tras el pago |
| RF-10 | Notificaciones | Avisos en la app (tabla `notificaciones`) |
| RF-11 | Verificación de prestadores | Admin → Verificación |
| RF-12 | Administración y soporte | Admin → Panel, Reportes y **Soporte** (responder tickets) |
| RF-13 | Planes premium | Prestador → Plan Premium |

## Estructura
```
App.js                 Navegación principal por rol
metro.config.js        Monta la API dentro del servidor de Expo
backend/config.js      Lee la conexión a MySQL
backend/config.local.js ← Tus datos de MySQL (no se sube a GitHub)
backend/db.js          Conexión, creación de tablas y datos iniciales
backend/api.js         Rutas de la API REST
backend/server.js      API independiente (npm run api)
backend/servicerca.sql Respaldo SQL de la base
src/api.js             Cliente HTTP de la app
src/store.js           Estado de la app sincronizado con la API
src/screens/           Pantallas: auth, client, provider, admin, shared
assets/                Logotipo, íconos de roles
```
