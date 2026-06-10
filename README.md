# DigitalCV

DigitalCV es un CV/portfolio web interactivo para Martin Guillen. El sitio publico muestra perfil, experiencia, formacion, habilidades, proyectos, logros y contacto. Incluye un dashboard privado para editar contenido JSON, revisar metricas basicas y administrar configuracion general.

## Tecnologias

- Backend: Node.js, Express.
- Frontend: React real, ReactDOM, React Router y Vite.
- Estilos: Bootstrap 5 + CSS propio responsive con modo claro/oscuro.
- Persistencia: MongoDB con Mongoose.
- Auth admin: JWT con credenciales desde variables de entorno.
- Metricas: registros anonimos en la coleccion `analytics_events`.

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
  /uploads
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
MONGODB_URI=mongodb://127.0.0.1:27017/digitalcv
```

`.env` esta ignorado por Git.

## Migracion desde JSON

Los JSON originales de `server/data` quedan como respaldo y fuente de importacion. Para cargar esos datos en MongoDB:

```bash
npm install
npm run migrate:json
```

El script usa `MONGODB_URI` y no duplica documentos si se ejecuta mas de una vez. Por defecto inserta solo recursos o eventos faltantes. Si queres sobrescribir MongoDB con el contenido actual de los JSON:

```bash
npm run migrate:json -- --force
```

## Desarrollo

MongoDB debe estar corriendo antes de iniciar el backend. Para MongoDB local, usar en `.env`:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/digitalcv
```

Opciones para levantar MongoDB local:

```bash
# Si MongoDB esta instalado como servicio de Windows
net start MongoDB

# O con Docker Desktop corriendo
docker run --name digitalcv-mongo -p 27017:27017 -d mongo:7
```

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
- `POST /api/admin/settings/cv`
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

En `/admin/settings`, la seccion `CV en PDF` permite subir el PDF que usa el boton `Descargar CV` del navbar publico. El archivo debe ser PDF y pesar hasta 5 MB. Al subirlo, queda disponible publicamente en `/uploads/cv/cv.pdf` y MongoDB guarda `cvUrl`, `cvFileName` y `cvUpdatedAt` dentro del recurso `settings`.

## Datos

Los datos se editan desde el admin y se persisten en MongoDB:

- `profile`
- `experience`
- `education`
- `skills`
- `projects`
- `achievements`
- `settings`

Los archivos JSON de `server/data` no se usan como persistencia principal. Se conservan para respaldo y para ejecutar `npm run migrate:json`.

## Persistencia MongoDB

La conexion esta centralizada en `server/config/mongodb.js` y usa `MONGODB_URI`. Los recursos de contenido se guardan en `content_resources`, manteniendo el payload original en `value` para no cambiar los contratos del frontend. Los eventos de metricas se guardan como documentos individuales en `analytics_events`.

Si MongoDB no conecta al arrancar, el backend no queda escuchando a medias: muestra el error real y termina el proceso. Si la conexion se pierde durante la ejecucion, los endpoints que requieren datos responden `503` con un mensaje claro en vez de dejar la request pendiente.

El PDF cargado desde el admin se guarda actualmente en filesystem local: `server/uploads/cv/cv.pdf`. Esto funciona localmente y puede funcionar en algunos hostings, pero en hostings gratuitos con filesystem efimero el archivo puede perderse al redeployar o reiniciar. En una version futura conviene migrar estos archivos a almacenamiento persistente como Supabase Storage, Cloudinary, S3 compatible, Firebase Storage u otro servicio equivalente.

## Scripts

```bash
npm run dev
npm run dev:server
npm run dev:client
npm run migrate:json
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

### MongoDB no conectado

Si el backend no arranca o los endpoints responden `503`, revisar que `.env` tenga `MONGODB_URI`, que MongoDB este corriendo y que se haya ejecutado `npm run migrate:json` al menos una vez para importar el contenido inicial.
