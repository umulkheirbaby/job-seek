const ApiError = require('../utils/ApiError');

const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required', 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, 'You do not have permission to perform this action', 'FORBIDDEN')
      );
    }

    return next();
  };

module.exports = authorize;
