const mongoose = require('mongoose');
const ApiError = require('../../utils/ApiError');
const { User, toPublicUser } = require('./user.model');

const toAdminUser = (user) => ({
  ...toPublicUser(user),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const listUsers = async ({ role, status, search } = {}) => {
  const query = {};

  if (role) {
    query.role = role;
  }

  if (status) {
    query.status = status;
  }

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { email: { $regex: escaped, $options: 'i' } },
    ];
  }

  const users = await User.find(query).sort({ createdAt: -1 });
  return users.map(toAdminUser);
};

const updateUserStatus = async (id, actor, status) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'User not found', 'NOT_FOUND');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found', 'NOT_FOUND');
  }

  if (String(user._id) === String(actor._id)) {
    throw new ApiError(403, 'You cannot change your own account status', 'FORBIDDEN');
  }

  if (user.role === 'admin') {
    throw new ApiError(403, 'Administrator accounts cannot be changed here', 'FORBIDDEN');
  }

  user.status = status;
  await user.save();
  return toAdminUser(user);
};

module.exports = { listUsers, updateUserStatus };
