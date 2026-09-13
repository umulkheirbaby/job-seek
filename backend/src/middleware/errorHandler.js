const { env } = require('../config/env');

const errorHandler = (err, req, res, next) => {
  void next;

  const statusCode = err.statusCode || 500;
  const payload = {
    success: false,
    message: err.message || 'Internal server error',
    code: err.code || (statusCode === 500 ? 'INTERNAL_ERROR' : 'ERROR'),
  };

  if (err.errors) {
    payload.errors = err.errors;
  }

  if (env.nodeEnv === 'development' && err.stack) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};

module.exports = errorHandler;
