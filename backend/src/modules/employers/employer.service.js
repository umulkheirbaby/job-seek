const mongoose = require('mongoose');
const ApiError = require('../../utils/ApiError');
const { User } = require('../users/user.model');
const { Employer, computeEmployerStats, toPublicEmployer } = require('./employer.model');
const { countJobsForEmployer } = require('../jobs/job.service');
const { countApplicationsForEmployer } = require('../applications/application.service');

const ensureEmployer = async (userId) => {
  let employer = await Employer.findOne({ userId });
  if (!employer) {
    employer = await Employer.create({ userId, verificationStatus: 'pending' });
  }
  return employer;
};

const withJobCount = async (employer) => {
  const stats = computeEmployerStats(employer);
  stats.jobs = await countJobsForEmployer(employer._id);
  stats.applications = await countApplicationsForEmployer(employer._id);
  return stats;
};

const getMyEmployer = async (userId) => {
  const employer = await ensureEmployer(userId);
  return {
    employer: toPublicEmployer(employer),
    stats: await withJobCount(employer),
  };
};

const updateMyEmployer = async (userId, input) => {
  const employer = await ensureEmployer(userId);
  Object.assign(employer, input);
  await employer.save();

  return {
    employer: toPublicEmployer(employer),
    stats: await withJobCount(employer),
  };
};

const getPublicEmployer = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Employer not found', 'NOT_FOUND');
  }

  const employer = await Employer.findById(id);
  if (!employer || employer.verificationStatus !== 'approved') {
    throw new ApiError(404, 'Employer not found', 'NOT_FOUND');
  }

  const user = await User.findById(employer.userId);

  return {
    employer: toPublicEmployer(employer),
    user: user ? { _id: user._id, name: user.name, role: user.role } : null,
    stats: computeEmployerStats(employer),
  };
};

const listEmployers = async (status) => {
  const query = status ? { verificationStatus: status } : {};
  const employers = await Employer.find(query).sort({ createdAt: -1 });
  const userIds = employers.map((item) => item.userId);
  const users = await User.find({ _id: { $in: userIds } });
  const usersById = new Map(users.map((user) => [String(user._id), user]));

  return employers.map((employer) => ({
    employer: toPublicEmployer(employer),
    user: usersById.get(String(employer.userId))
      ? {
          _id: usersById.get(String(employer.userId))._id,
          name: usersById.get(String(employer.userId)).name,
          email: usersById.get(String(employer.userId)).email,
        }
      : null,
    stats: computeEmployerStats(employer),
  }));
};

const verifyEmployer = async (id, input) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Employer not found', 'NOT_FOUND');
  }

  const employer = await Employer.findById(id);
  if (!employer) {
    throw new ApiError(404, 'Employer not found', 'NOT_FOUND');
  }

  employer.verificationStatus = input.verificationStatus;
  employer.verificationNote = input.verificationNote;
  await employer.save();

  return {
    employer: toPublicEmployer(employer),
    stats: computeEmployerStats(employer),
  };
};

module.exports = {
  ensureEmployer,
  getMyEmployer,
  updateMyEmployer,
  getPublicEmployer,
  listEmployers,
  verifyEmployer,
};
