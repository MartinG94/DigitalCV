const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

let connectionPromise = null;

function redactMongoUri(uri) {
  if (!uri) return '';

  try {
    const parsed = new URL(uri);

    if (parsed.username) parsed.username = '***';
    if (parsed.password) parsed.password = '***';

    return parsed.toString();
  } catch (_error) {
    return uri.replace(/\/\/([^@/]+)@/, '//***@');
  }
}

function getMongoState() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  return states[mongoose.connection.readyState] || 'unknown';
}

function createMongoUnavailableError(detail) {
  const error = new Error(detail || 'MongoDB no esta conectado.');
  error.status = 503;
  error.code = 'MONGO_NOT_CONNECTED';
  return error;
}

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

function getMongoConnectionInfo() {
  return {
    hasUri: Boolean(process.env.MONGODB_URI),
    redactedUri: redactMongoUri(process.env.MONGODB_URI),
    state: getMongoState(),
    host: mongoose.connection.host,
    name: mongoose.connection.name
  };
}

function requireMongoConnection() {
  if (isMongoConnected()) return;

  const state = getMongoState();
  throw createMongoUnavailableError(
    `MongoDB no esta conectado (estado: ${state}). Revisar MONGODB_URI y que el servicio este disponible.`
  );
}

async function connectMongo(logger = console) {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw createMongoUnavailableError('MONGODB_URI no esta configurado.');
  }

  if (isMongoConnected()) {
    logger.info(`[MongoDB] Ya conectado a ${mongoose.connection.host}/${mongoose.connection.name}.`);
    return mongoose.connection;
  }

  if (connectionPromise && mongoose.connection.readyState === 2) {
    logger.info('[MongoDB] Conexion en curso; reutilizando intento existente.');
    return connectionPromise;
  }

  logger.info(`[MongoDB] MONGODB_URI detectada: ${redactMongoUri(uri)}`);
  logger.info('[MongoDB] Intentando conectar...');

  connectionPromise = mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    })
    .then(() => {
      logger.info(`[MongoDB] Conexion establecida con ${mongoose.connection.host}/${mongoose.connection.name}.`);
      return mongoose.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      throw error;
    });

  return connectionPromise;
}

module.exports = {
  connectMongo,
  createMongoUnavailableError,
  getMongoConnectionInfo,
  getMongoState,
  isMongoConnected,
  mongoose,
  redactMongoUri,
  requireMongoConnection
};
