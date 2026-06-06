# DigitalCV

DigitalCV es una primera versión funcional de un CV/portfolio online para **Martín Guillén**, pensado para compartir con recruiters y presentar experiencia, formación, habilidades, logros y proyectos en una landing moderna, responsive y dinámica.

El proyecto usa un backend con **Node.js + Express** y un frontend con **React**. Los datos iniciales se leen desde archivos JSON locales para que sea sencillo editar el contenido sin base de datos. La estructura queda preparada para crecer luego hacia una base de datos, panel administrador, autenticación o gestión de contenidos.

## Tecnologías utilizadas

- **Backend:** Node.js, Express.
- **Frontend:** componentes estilo React cargados como módulos ES en el navegador, sin paso de build obligatorio para desarrollo local.
- **Estilos:** CSS moderno, responsive design, variables CSS, cards y layout adaptable.
- **Datos:** JSON local en `server/data`.
- **Build simple:** script Node que prepara `dist/client` para producción.

## Estructura del proyecto

```txt
/DigitalCV
  /client
    /public
      index.html
      /cv
    /src
      /components
      /sections
      /services
      /assets
      App.jsx
      main.jsx
      styles.css
  /server
    /data
      profile.json
      experience.json
      education.json
      skills.json
      projects.json
      achievements.json
    index.js
  /scripts
    build-client.js
  README.md
  package.json
```

> Nota: se conserva la carpeta histórica `DigitalCV/` generada por Express para no borrar código existente sin necesidad. La versión funcional actual vive en `client/`, `server/` y scripts de raíz.

## Endpoints disponibles

La API expone los siguientes endpoints:

- `GET /api/profile`
- `GET /api/experience`
- `GET /api/education`
- `GET /api/skills`
- `GET /api/projects`
- `GET /api/achievements`
- `GET /api/health`

## Instalación

Desde la raíz del repositorio:

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npm run dev
```

Luego abrir:

```txt
http://localhost:3000
```

En desarrollo, Express sirve el frontend desde `client/public` y `client/src`, además de exponer la API bajo `/api`.

## Build para producción

```bash
npm run build
```

Esto genera una carpeta `dist/client` con el frontend listo para ser servido por Express.

Para ejecutar el servidor en modo producción:

```bash
npm start
```

## Cómo modificar los datos del CV

Editar los archivos JSON ubicados en `server/data`:

- `profile.json`: nombre, rol, ubicación, resumen, tecnologías principales y contacto.
- `experience.json`: experiencia laboral, responsabilidades y tecnologías.
- `education.json`: formación académica y capacitaciones.
- `skills.json`: habilidades agrupadas por categoría.
- `projects.json`: proyectos, tecnologías, links, estado e imagen opcional.
- `achievements.json`: logros, certificaciones e hitos académicos.

Los cambios se reflejan al recargar la página porque el frontend consume los endpoints del backend.

## Contacto y CV en PDF

La sección de contacto incluye:

- Email placeholder.
- LinkedIn placeholder.
- GitHub placeholder.
- Botón de descarga preparado en `/cv/martin-guillen-cv.pdf`.

Cuando exista el PDF real, colocarlo en:

```txt
client/public/cv/martin-guillen-cv.pdf
```

## Deploy sugerido

Opciones gratuitas compatibles:

### Render o Railway

1. Conectar el repositorio.
2. Configurar build command:

   ```bash
   npm install && npm run build
   ```

3. Configurar start command:

   ```bash
   npm start
   ```

4. Asegurar que la variable `PORT` sea gestionada por la plataforma.

### Vercel o Netlify

Para una versión full-stack con Express puede requerirse adaptar el backend a funciones serverless. Como alternativa inicial, usar Render/Railway para desplegar frontend y backend juntos en un único servicio Node.

## Próximas mejoras sugeridas

- Reemplazar placeholders por datos profesionales definitivos.
- Agregar archivo real de CV en PDF.
- Incorporar imágenes reales de proyectos.
- Agregar tests automatizados para endpoints y componentes.
- Añadir un panel administrador para editar contenido.
- Migrar datos JSON a una base de datos.
- Incorporar autenticación para administración.
- Agregar analytics liviano y metadatos Open Graph para compartir el perfil.
