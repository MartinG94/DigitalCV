const fs = require('fs');

const loggerMiddleware = (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  };

// NOTA: Debe actualizar un archivo.

module.exports = loggerMiddleware;