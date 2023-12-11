const fs = require('fs');

const loggerMiddleware = (req, res, next) => {
  const currentDate = new Date();
    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()} - ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}:${currentDate.getSeconds().toString().padStart(2, '0')}.${currentDate.getMilliseconds().toString().padStart(3, '0')}`;
    console.log(`${formattedDate} - ${req.method} ${req.url}`);
    next();
  };

// NOTA: Debe actualizar un archivo.

module.exports = loggerMiddleware;