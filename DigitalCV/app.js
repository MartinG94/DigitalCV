/* IMPORTS */
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const PORT = process.env.PORT || 3000;
const loggerMiddleware = require('./middlewares/loggerMiddleware');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

/* CONFIGURACIÓN DEL SERVIDOR */
var app = express();

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
});

/* CONFIGURACIÓN DEL MOTOR DE VISTAS */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* MIDDLEWARES */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(loggerMiddleware);

/* ENRUTAMIENTO */
app.use('/', indexRouter);
app.use('/users', usersRouter);

/* MANEJO DE ERRORES */
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
