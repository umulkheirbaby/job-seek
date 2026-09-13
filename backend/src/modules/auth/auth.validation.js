const ApiError = require('../../utils/ApiError');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PUBLIC_ROLES = ['job_seeker', 'employer'];

const collectErrors = (checks) => {
  const errors = {};

  checks.forEach(({ field, valid, message }) => {
    if (!valid) {
      errors[field] = message;
    }
  });

  if (Object.keys(errors).length > 0) {
    throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', errors);
  }
};

const validateRegister = (body = {}) => {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const role = typeof body.role === 'string' ? body.role : '';

  collectErrors([
    { field: 'name', valid: name.length >= 2, message: 'Name is required' },
    { field: 'email', valid: EMAIL_PATTERN.test(email), message: 'A valid email is required' },
    {
      field: 'password',
      valid: password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password),
      message: 'Password must be at least 8 characters and include a letter and a number',
    },
    {
      field: 'role',
      valid: PUBLIC_ROLES.includes(role),
      message: 'Role must be job_seeker or employer',
    },
  ]);

  return { name, email, password, role };
};

const validateLogin = (body = {}) => {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  collectErrors([
    { field: 'email', valid: EMAIL_PATTERN.test(email), message: 'A valid email is required' },
    { field: 'password', valid: password.length > 0, message: 'Password is required' },
  ]);

  return { email, password };
};

module.exports = { validateRegister, validateLogin };
