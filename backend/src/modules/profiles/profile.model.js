const mongoose = require('mongoose');

const VERIFICATION_STATUSES = ['pending', 'approved', 'rejected', 'suspended'];

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, trim: true, default: '' },
    qualification: { type: String, trim: true, default: '' },
    field: { type: String, trim: true, default: '' },
    startDate: Date,
    endDate: Date,
  },
  { _id: true }
);

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, trim: true, default: '' },
    position: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    startDate: Date,
    endDate: Date,
  },
  { _id: true }
);

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    phone: { type: String, trim: true, default: '' },
    location: {
      country: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
    },
    bio: { type: String, trim: true, default: '' },
    skills: { type: [String], default: [] },
    education: { type: [educationSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    cvUrl: { type: String, trim: true, default: '' },
    portfolioUrl: { type: String, trim: true, default: '' },
    documentStoredName: { type: String, trim: true, default: '' },
    documentOriginalName: { type: String, trim: true, default: '' },
    documentSize: { type: Number, default: 0 },
    documentUrl: { type: String, trim: true, default: '' },
    verificationStatus: {
      type: String,
      enum: VERIFICATION_STATUSES,
      default: 'pending',
    },
    verificationNote: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

const computeProfileStats = (profile) => {
  const checks = [
    Boolean(profile.phone),
    Boolean(profile.bio),
    Boolean(profile.location?.country),
    Boolean(profile.location?.city),
    profile.skills.length > 0,
    profile.education.length > 0,
    profile.experience.length > 0,
    Boolean(profile.documentStoredName || profile.cvUrl),
    Boolean(profile.portfolioUrl),
  ];

  const filled = checks.filter(Boolean).length;
  const verificationStatus = profile.verificationStatus || 'pending';
  const hasDocument = Boolean(profile.documentStoredName);

  return {
    completion: Math.round((filled / checks.length) * 100),
    skills: profile.skills.length,
    education: profile.education.length,
    experience: profile.experience.length,
    hasCv: hasDocument || Boolean(profile.cvUrl),
    hasDocument,
    hasPortfolio: Boolean(profile.portfolioUrl),
    verificationStatus,
    canApply: verificationStatus === 'approved' && hasDocument,
  };
};

const toPublicProfile = (profile) => ({
  _id: profile._id,
  userId: profile.userId,
  phone: profile.phone || '',
  location: {
    country: profile.location?.country || '',
    city: profile.location?.city || '',
  },
  bio: profile.bio || '',
  skills: profile.skills || [],
  education: profile.education || [],
  experience: profile.experience || [],
  cvUrl: profile.cvUrl || '',
  portfolioUrl: profile.portfolioUrl || '',
  hasDocument: Boolean(profile.documentStoredName),
  documentOriginalName: profile.documentOriginalName || '',
  documentSize: profile.documentSize || 0,
  verificationStatus: profile.verificationStatus || 'pending',
  verificationNote: profile.verificationNote || '',
  createdAt: profile.createdAt,
  updatedAt: profile.updatedAt,
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = { Profile, VERIFICATION_STATUSES, computeProfileStats, toPublicProfile };
