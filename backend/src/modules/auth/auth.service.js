const bcrypt = require('bcryptjs');
const ApiError = require('../../utils/ApiError');
const { User, toPublicUser } = require('../users/user.model');
const { ensureProfile } = require('../profiles/profile.service');
const { ensureEmployer } = require('../employers/employer.service');

const SALT_ROUNDS = 10;

const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists', 'CONFLICT');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    status: 'active',
  });

  if (user.role === 'job_seeker') {
    await ensureProfile(user._id);
  }

  if (user.role === 'employer') {
    await ensureEmployer(user._id);
  }

  return toPublicUser(user);
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  const matches = user ? await bcrypt.compare(password, user.password) : false;

  if (!user || !matches) {
    throw new ApiError(401, 'Invalid email or password', 'UNAUTHORIZED');
  }

  if (user.status !== 'active') {
    throw new ApiError(403, 'This account is not allowed to sign in', 'FORBIDDEN');
  }

  return toPublicUser(user);
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
  }

  if (user.status !== 'active') {
    throw new ApiError(403, 'This account is not allowed to sign in', 'FORBIDDEN');
  }

  return toPublicUser(user);
};

module.exports = { register, login, getCurrentUser };
