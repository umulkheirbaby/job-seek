const mongoose = require('mongoose');

const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contract', 'freelance', 'internship'];
const WORK_TYPES = ['remote', 'hybrid', 'onsite'];
const EXPERIENCE_LEVELS = ['junior', 'mid', 'senior'];
const JOB_STATUSES = ['pending', 'published', 'closed', 'rejected'];

const jobSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    skills: { type: [String], default: [] },
    employmentType: { type: String, enum: EMPLOYMENT_TYPES, required: true },
    workType: { type: String, enum: WORK_TYPES, required: true },
    experienceLevel: { type: String, enum: EXPERIENCE_LEVELS, default: 'junior' },
    location: {
      country: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
    },
    salary: {
      min: { type: Number, default: null },
      max: { type: Number, default: null },
      currency: { type: String, trim: true, default: 'USD' },
    },
    status: { type: String, enum: JOB_STATUSES, default: 'pending', index: true },
    deadline: Date,
    reviewNote: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

jobSchema.index({ status: 1, workType: 1, employmentType: 1 });

const toPublicJob = (job, employer) => ({
  _id: job._id,
  employerId: job.employerId,
  title: job.title,
  description: job.description,
  skills: job.skills || [],
  employmentType: job.employmentType,
  workType: job.workType,
  experienceLevel: job.experienceLevel,
  location: {
    country: job.location?.country || '',
    city: job.location?.city || '',
  },
  salary: {
    min: job.salary?.min ?? null,
    max: job.salary?.max ?? null,
    currency: job.salary?.currency || 'USD',
  },
  status: job.status,
  deadline: job.deadline || null,
  reviewNote: job.reviewNote || '',
  companyName: employer?.companyName || '',
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
});

const Job = mongoose.model('Job', jobSchema);

module.exports = {
  Job,
  EMPLOYMENT_TYPES,
  WORK_TYPES,
  EXPERIENCE_LEVELS,
  JOB_STATUSES,
  toPublicJob,
};
