const ApiError = require('../utils/ApiError');
const { env } = require('../config/env');
const { verifyAuthToken } = require('../utils/jwt');
const { User, toPublicUser } = require('../modules/users/user.model');

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.[env.cookieName];
    if (!token) {
      throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    let payload;
    try {
      payload = verifyAuthToken(token);
    } catch {
      throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    if (user.status !== 'active') {
      throw new ApiError(403, 'This account is not allowed to sign in', 'FORBIDDEN');
    }

    req.user = toPublicUser(user);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = requireAuth;
