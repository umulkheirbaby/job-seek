const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const { signAuthToken } = require('../../utils/jwt');
const { setAuthCookie, clearAuthCookie } = require('../../utils/authCookie');
const { validateRegister, validateLogin } = require('./auth.validation');
const authService = require('./auth.service');

const register = asyncHandler(async (req, res) => {
  const input = validateRegister(req.body);
  const user = await authService.register(input);
  setAuthCookie(res, signAuthToken(user));

  sendSuccess(res, {
    statusCode: 201,
    message: 'Registration successful',
    data: { user },
  });
});

const login = asyncHandler(async (req, res) => {
  const input = validateLogin(req.body);
  const user = await authService.login(input);
  setAuthCookie(res, signAuthToken(user));

  sendSuccess(res, {
    message: 'Login successful',
    data: { user },
  });
});

const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);

  sendSuccess(res, {
    message: 'Logged out',
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);

  sendSuccess(res, {
    message: 'Current user',
    data: { user },
  });
});

module.exports = { register, login, logout, me };
