require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { ensureJsonFile } = require('./utils/jsonStorage');

const app = express();
const PORT = process.env.PORT || 3000;
const clientDir = path.join(__dirname, '..', 'client');
const clientDistPath = path.join(clientDir, 'dist');
const clientIndexPath = path.join(clientDistPath, 'index.html');
const cvPath = path.join(clientDir, 'public', 'cv');
const isProduction = process.env.NODE_ENV === 'production';

app.use(morgan('dev'));
app.use(express.json());
const moduleStaticOptions = {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
      res.type('application/javascript');
    }

    if (filePath.endsWith('.css')) {
      res.type('text/css');
    }
  }
};

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', analyticsRoutes);
app.use('/cv', express.static(cvPath));

if (isProduction && fs.existsSync(clientIndexPath)) {
  app.use(express.static(clientDistPath, moduleStaticOptions));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }

    return res.sendFile(clientIndexPath);
  });
} else {
  app.get('/', (_req, res) => {
    res.json({
      message: 'Backend DigitalCV activo',
      frontend: 'En desarrollo usar http://localhost:5173',
      api: '/api/profile'
    });
  });

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }

    res.status(404).json({
      message: 'Frontend no servido por Express en desarrollo.',
      frontend: 'Abrir http://localhost:5173'
    });
  });
}

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: 'No se pudo procesar la solicitud.',
    detail: process.env.NODE_ENV === 'production' ? undefined : error.message
  });
});

async function prepareDataFiles() {
  await ensureJsonFile('settings.json', {
    siteTitle: 'DigitalCV | Martin Guillen',
    heroSubtitle: 'CV interactivo para recruiters y oportunidades profesionales.',
    aboutText: 'Perfil orientado al analisis, desarrollo y mantenimiento de soluciones web y sistemas de gestion.',
    email: 'martin.guillen@example.com',
    linkedin: 'https://www.linkedin.com/in/completar-linkedin',
    github: 'https://github.com/completar-github',
    cvPdf: '/cv/martin-guillen-cv.pdf',
    primaryButtonText: 'Contactar',
    availability: 'Escuchando propuestas'
  });
  await ensureJsonFile('analytics/events.json', []);
}

prepareDataFiles()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`DigitalCV disponible en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo preparar DigitalCV.', error);
    process.exit(1);
  });
