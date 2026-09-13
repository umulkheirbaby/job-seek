const ApiError = require('../../utils/ApiError');
const { ROLES, STATUSES } = require('./user.model');

const validateUserQuery = (query = {}) => {
  const role = typeof query.role === 'string' ? query.role.trim() : '';
  const status = typeof query.status === 'string' ? query.status.trim() : '';
  const search = typeof query.search === 'string' ? query.search.trim() : '';

  if (role && !ROLES.includes(role)) {
    throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
      role: 'Choose a valid role',
    });
  }

  if (status && !STATUSES.includes(status)) {
    throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
      status: 'Choose a valid account status',
    });
  }

  return { role, status, search };
};

const validateUserStatus = (body = {}) => {
  const status = typeof body.status === 'string' ? body.status : '';
  if (!STATUSES.includes(status)) {
    throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
      status: 'Status must be active, inactive, or suspended',
    });
  }

  return { status };
};

module.exports = { validateUserQuery, validateUserStatus };
