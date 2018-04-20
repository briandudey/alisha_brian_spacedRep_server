'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv').config();
const passport = require('passport');

const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');
const jwtStrategy = require('./auth/jwt');
const localStrategy = require('./auth/local-strategy');

const userRouter = require('./routes/user-route');
const loginRouter = require('./routes/login-route');
const registerRouter = require('./routes/register-route');


const app = express();

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(cors());

/* ========== BODYPARSING MIDDLEWARE ========== */
app.use(express.json());

/* ========== PASSPORT MIDDLEWARE ========== */
passport.use(jwtStrategy);
passport.use(localStrategy);


/* ========== ENPOINTS ========== */
app.use('/api/user', userRouter);
app.use('/api/login', loginRouter);
app.use('/api/register', registerRouter);


/* ========== ERROR HANDLING ========== */
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err : {}
  });
});



function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
