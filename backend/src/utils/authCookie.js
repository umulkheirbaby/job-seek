const { env } = require('../config/env');
const { expiresToMs } = require('./jwt');

const cookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  path: '/',
  maxAge: expiresToMs(env.jwtExpiresIn),
});

const setAuthCookie = (res, token) => {
  res.cookie(env.cookieName, token, cookieOptions());
};

const clearAuthCookie = (res) => {
  res.clearCookie(env.cookieName, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
    path: '/',
  });
};

module.exports = { setAuthCookie, clearAuthCookie };
