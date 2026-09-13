const mongoose = require('mongoose');
const ApiError = require('../../utils/ApiError');
const { Employer } = require('../employers/employer.model');
const { Job, toPublicJob } = require('./job.model');

const getEmployerForUser = async (userId) => {
  const employer = await Employer.findOne({ userId });
  if (!employer) {
    throw new ApiError(403, 'Complete your company profile first', 'FORBIDDEN');
  }
  return employer;
};

const withEmployers = async (jobs) => {
  const ids = [...new Set(jobs.map((job) => String(job.employerId)))];
  const employers = await Employer.find({ _id: { $in: ids } });
  const byId = new Map(employers.map((item) => [String(item._id), item]));
  return jobs.map((job) => toPublicJob(job, byId.get(String(job.employerId))));
};

const createJob = async (userId, input) => {
  const employer = await getEmployerForUser(userId);
  if (employer.verificationStatus !== 'approved') {
    throw new ApiError(403, 'Only verified employers can post jobs', 'FORBIDDEN');
  }

  const job = await Job.create({
    ...input,
    employerId: employer._id,
    status: 'pending',
  });

  return toPublicJob(job, employer);
};

const listPublishedJobs = async (query = {}) => {
  const filter = { status: 'published' };

  if (query.workType) {
    filter.workType = query.workType;
  }
  if (query.employmentType) {
    filter.employmentType = query.employmentType;
  }
  if (query.experienceLevel) {
    filter.experienceLevel = query.experienceLevel;
  }
  if (query.skill) {
    filter.skills = { $regex: new RegExp(query.skill, 'i') };
  }
  if (query.search) {
    const term = query.search.trim();
    filter.$or = [
      { title: { $regex: term, $options: 'i' } },
      { description: { $regex: term, $options: 'i' } },
      { skills: { $regex: term, $options: 'i' } },
    ];
  }

  const jobs = await Job.find(filter).sort({ createdAt: -1 });
  return withEmployers(jobs);
};

const listMyJobs = async (userId) => {
  const employer = await getEmployerForUser(userId);
  const jobs = await Job.find({ employerId: employer._id }).sort({ createdAt: -1 });
  return withEmployers(jobs);
};

const listJobsForAdmin = async (status) => {
  const filter = status ? { status } : {};
  const jobs = await Job.find(filter).sort({ createdAt: -1 });
  return withEmployers(jobs);
};

const getJobById = async (id, user) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Job not found', 'NOT_FOUND');
  }

  const job = await Job.findById(id);
  if (!job) {
    throw new ApiError(404, 'Job not found', 'NOT_FOUND');
  }

  const employer = await Employer.findById(job.employerId);
  const isOwner = user && employer && String(employer.userId) === String(user._id);
  const isAdmin = user?.role === 'admin';

  if (job.status !== 'published' && !isOwner && !isAdmin) {
    throw new ApiError(404, 'Job not found', 'NOT_FOUND');
  }

  return toPublicJob(job, employer);
};

const updateJob = async (id, userId, input) => {
  const employer = await getEmployerForUser(userId);
  const job = await Job.findOne({ _id: id, employerId: employer._id });
  if (!job) {
    throw new ApiError(404, 'Job not found', 'NOT_FOUND');
  }

  if (job.status === 'closed') {
    throw new ApiError(403, 'Closed jobs cannot be edited', 'FORBIDDEN');
  }

  Object.assign(job, input);
  if (job.status === 'published' || job.status === 'rejected') {
    job.status = 'pending';
    job.reviewNote = '';
  }
  await job.save();

  return toPublicJob(job, employer);
};

const removeJob = async (id, userId) => {
  const employer = await getEmployerForUser(userId);
  const job = await Job.findOne({ _id: id, employerId: employer._id });
  if (!job) {
    throw new ApiError(404, 'Job not found', 'NOT_FOUND');
  }

  if (job.status === 'published') {
    job.status = 'closed';
    await job.save();
    return toPublicJob(job, employer);
  }

  await job.deleteOne();
  return toPublicJob(job, employer);
};

const reviewJob = async (id, input) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Job not found', 'NOT_FOUND');
  }

  const job = await Job.findById(id);
  if (!job) {
    throw new ApiError(404, 'Job not found', 'NOT_FOUND');
  }

  job.status = input.status;
  job.reviewNote = input.reviewNote;
  await job.save();

  const employer = await Employer.findById(job.employerId);
  return toPublicJob(job, employer);
};

const countJobsForEmployer = async (employerId) => Job.countDocuments({ employerId });

module.exports = {
  createJob,
  listPublishedJobs,
  listMyJobs,
  listJobsForAdmin,
  getJobById,
  updateJob,
  removeJob,
  reviewJob,
  countJobsForEmployer,
};
