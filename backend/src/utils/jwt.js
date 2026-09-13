const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

const expiresToMs = (value) => {
  if (typeof value === 'number') {
    return value * 1000;
  }

  const match = /^(\d+)([smhd])$/.exec(String(value));
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 }[match[2]];
  return amount * unit;
};

const signAuthToken = (user) =>
  jwt.sign({ sub: String(user._id), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

const verifyAuthToken = (token) => jwt.verify(token, env.jwtSecret);

module.exports = { signAuthToken, verifyAuthToken, expiresToMs };
