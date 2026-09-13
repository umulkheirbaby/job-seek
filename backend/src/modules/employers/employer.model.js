const mongoose = require('mongoose');

const VERIFICATION_STATUSES = ['pending', 'approved', 'rejected', 'suspended'];

const employerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' },
    industry: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    verificationStatus: {
      type: String,
      enum: VERIFICATION_STATUSES,
      default: 'pending',
    },
    verificationNote: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

const computeEmployerStats = (employer) => {
  const checks = [
    Boolean(employer.companyName),
    Boolean(employer.description),
    Boolean(employer.website),
    Boolean(employer.industry),
    Boolean(employer.country),
    Boolean(employer.city),
  ];
  const filled = checks.filter(Boolean).length;

  return {
    completion: Math.round((filled / checks.length) * 100),
    verificationStatus: employer.verificationStatus,
    canPostJobs: employer.verificationStatus === 'approved',
    jobs: 0,
    applications: 0,
  };
};

const toPublicEmployer = (employer) => ({
  _id: employer._id,
  userId: employer.userId,
  companyName: employer.companyName || '',
  description: employer.description || '',
  website: employer.website || '',
  industry: employer.industry || '',
  country: employer.country || '',
  city: employer.city || '',
  verificationStatus: employer.verificationStatus,
  verificationNote: employer.verificationNote || '',
  createdAt: employer.createdAt,
  updatedAt: employer.updatedAt,
});

const Employer = mongoose.model('Employer', employerSchema);

module.exports = {
  Employer,
  VERIFICATION_STATUSES,
  computeEmployerStats,
  toPublicEmployer,
};
