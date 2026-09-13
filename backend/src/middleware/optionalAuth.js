const { env } = require('../config/env');
const { verifyAuthToken } = require('../utils/jwt');
const { User, toPublicUser } = require('../modules/users/user.model');

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.[env.cookieName];
    if (!token) {
      return next();
    }

    const payload = verifyAuthToken(token);
    const user = await User.findById(payload.sub);
    if (user && user.status === 'active') {
      req.user = toPublicUser(user);
    }
  } catch {
    // Public routes still work without a valid session.
  }

  return next();
};

module.exports = optionalAuth;
