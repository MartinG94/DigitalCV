const express = require('express');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { connectMongo, getMongoConnectionInfo, getMongoState } = require('./config/mongodb');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const clientDir = path.join(__dirname, '..', 'client');
const clientDistPath = path.join(clientDir, 'dist');
const clientIndexPath = path.join(clientDistPath, 'index.html');
const uploadsPath = path.join(__dirname, 'uploads');
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
app.use('/uploads', express.static(uploadsPath));

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
    message: error.code === 'MONGO_NOT_CONNECTED' ? error.message : 'No se pudo procesar la solicitud.',
    detail: process.env.NODE_ENV === 'production' ? undefined : error.message
  });
});

function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`DigitalCV API escuchando en http://localhost:${PORT}`);
    console.log(`MongoDB: ${getMongoState()}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`El puerto ${PORT} ya esta en uso. Cerra el proceso anterior o configura otro puerto con PORT.`);
      process.exit(1);
    }

    console.error('No se pudo iniciar DigitalCV API.', error);
    process.exit(1);
  });
}

async function boot() {
  const mongoInfo = getMongoConnectionInfo();
  console.log(`[MongoDB] Variable MONGODB_URI: ${mongoInfo.hasUri ? 'configurada' : 'no configurada'}.`);

  await connectMongo();
  startServer();
}

boot().catch((error) => {
  console.error(`[MongoDB] No se pudo conectar (${getMongoState()}): ${error.message}`);
  console.error('DigitalCV API no se inicio porque MongoDB es requerido para los endpoints de contenido.');
  process.exit(1);
});
