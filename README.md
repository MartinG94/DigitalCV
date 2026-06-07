# DigitalCV

DigitalCV es un CV/portfolio web interactivo para Martin Guillen. El sitio publico muestra perfil, experiencia, formacion, habilidades, proyectos, logros y contacto. Incluye un dashboard privado para editar contenido JSON, revisar metricas basicas y administrar configuracion general.

## Tecnologias

- Backend: Node.js, Express.
- Frontend: React real, ReactDOM, React Router y Vite.
- Estilos: Bootstrap 5 + CSS propio responsive con modo claro/oscuro.
- Persistencia inicial: JSON local en `server/data`.
- Auth admin: JWT con credenciales desde variables de entorno.
- Metricas: registros anonimos en `server/data/analytics/events.json`.

## Estructura

```txt
/client
  index.html
  vite.config.js
  /public
  /src
    /components
    /components/admin
    /context
    /pages
    /pages/admin
    /sections
    /services
    App.jsx
    main.jsx
    styles.css
/server
  /data
  /middleware
  /routes
  /utils
  index.js
```

La carpeta historica `DigitalCV/` se conserva para no borrar codigo existente, pero la app funcional actual vive en `client/` y `server/`.

## Instalacion

```bash
npm install
```

## Variables de entorno

Crear `.env` desde `.env.example`:

```bash
ADMIN_USER=admin
ADMIN_PASSWORD=secret
JWT_SECRET=change-this-secret
PORT=3000
```

`.env` esta ignorado por Git.

## Desarrollo

```bash
npm run dev
```

Esto levanta:

- Backend Express: `http://localhost:3000`
- Frontend Vite: `http://localhost:5173`

Vite tiene proxy para `/api`, por lo que el frontend llama a endpoints como `/api/profile` sin hardcodear localhost.

Verificaciones rapidas:

```txt
http://localhost:3000/api/health
http://localhost:5173/api/health
```

Rutas principales:

```txt
http://localhost:5173
http://localhost:5173/admin/login
http://localhost:5173/admin
http://localhost:5173/admin/content
http://localhost:5173/admin/projects
http://localhost:5173/admin/stats
http://localhost:5173/admin/settings
```

## Produccion local

```bash
npm run build
npm start
```

El build de Vite se genera en `client/dist` y Express lo sirve en produccion. Las rutas SPA como `/admin/settings` devuelven `client/dist/index.html`; las rutas `/api` siguen devolviendo JSON.

Abrir:

```txt
http://localhost:3000
http://localhost:3000/admin/login
```

## Endpoints publicos

- `GET /api/profile`
- `GET /api/experience`
- `GET /api/education`
- `GET /api/skills`
- `GET /api/projects`
- `GET /api/achievements`
- `GET /api/settings`
- `POST /api/interaction`
- `GET /api/health`

## Endpoints admin

Requieren `Authorization: Bearer <token>`.

- `POST /api/admin/login`
- `GET /api/admin/me`
- `POST /api/admin/logout`
- `GET /api/admin/content`
- `GET /api/admin/content/:resource`
- `PUT /api/admin/content/:resource`
- `GET /api/admin/metrics/summary`
- `GET /api/admin/metrics/recent`

Recursos editables: `profile`, `experience`, `education`, `skills`, `projects`, `achievements`, `settings`.

## Admin

El dashboard usa React Router real:

- `/admin` resumen
- `/admin/content` contenido JSON
- `/admin/projects` proyectos
- `/admin/stats` metricas
- `/admin/settings` configuracion

`AdminLayout` usa `Outlet` y un `ErrorBoundary` por seccion para que un error local no rompa sidebar, navbar ni logout.

## Datos

Los datos se editan desde el admin o directamente en `server/data`:

- `profile.json`
- `experience.json`
- `education.json`
- `skills.json`
- `projects.json`
- `achievements.json`
- `settings.json`

## Limitaciones de JSON local

La persistencia JSON sirve para esta primera version, pero en hostings gratuitos puede no ser persistente o perder cambios al redeployar. La estructura queda preparada para migrar luego a SQLite, PostgreSQL, MongoDB, Supabase o Firebase.

## Scripts

```bash
npm run dev
npm run dev:server
npm run dev:client
npm run build
npm start
npm run test
```

## Troubleshooting

### Puerto 3000 ocupado en Windows

Si al iniciar desarrollo aparece:

```txt
EADDRINUSE: address already in use :::3000
```

significa que ya hay otro proceso escuchando en el puerto del backend. Para ubicarlo:

```bat
netstat -ano | findstr :3000
```

Luego cerrar el proceso:

```bat
taskkill /PID <PID> /F
```

Otra opcion es usar:

```bash
npx kill-port 3000
```

Tambien se puede configurar otro puerto para Express con `PORT`, por ejemplo `PORT=3001`, pero en desarrollo local el proxy de Vite esta preparado para `http://localhost:3000`.

### Reinicios de nodemon por metricas

`nodemon.json` ignora `server/data/analytics/**` para que los eventos enviados a `/api/interaction` no reinicien el backend mientras se navega por el sitio.
