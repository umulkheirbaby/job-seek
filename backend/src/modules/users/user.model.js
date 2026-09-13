const mongoose = require('mongoose');

const ROLES = ['job_seeker', 'employer', 'admin'];
const STATUSES = ['active', 'inactive', 'suspended'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ROLES,
      required: true,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'active',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const toPublicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
});

const User = mongoose.model('User', userSchema);

module.exports = { User, ROLES, STATUSES, toPublicUser };
