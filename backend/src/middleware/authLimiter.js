const rateLimit = require('express-rate-limit');
const { env } = require('../config/env');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.nodeEnv === 'test' ? 1000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many attempts. Try again later.',
      code: 'TOO_MANY_REQUESTS',
    });
  },
});

module.exports = authLimiter;
