const mongoose = require('mongoose');

const APPLICATION_STATUSES = ['applied', 'reviewing', 'shortlisted', 'interview', 'hired', 'rejected'];

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverLetter: { type: String, trim: true, default: '' },
    cvUrl: { type: String, trim: true, default: '' },
    documentStoredName: { type: String, trim: true, default: '' },
    documentOriginalName: { type: String, trim: true, default: '' },
    documentSize: { type: Number, default: 0 },
    documentUrl: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: 'applied',
    },
  },
  { timestamps: true }
);

applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
applicationSchema.index({ candidateId: 1, createdAt: -1 });

const toPublicApplication = (application, extras = {}) => ({
  _id: application._id,
  jobId: application.jobId,
  candidateId: application.candidateId,
  coverLetter: application.coverLetter || '',
  cvUrl: application.cvUrl || '',
  hasDocument: Boolean(application.documentStoredName),
  documentOriginalName: application.documentOriginalName || '',
  documentSize: application.documentSize || 0,
  status: application.status,
  createdAt: application.createdAt,
  updatedAt: application.updatedAt,
  ...extras,
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = { Application, APPLICATION_STATUSES, toPublicApplication };
