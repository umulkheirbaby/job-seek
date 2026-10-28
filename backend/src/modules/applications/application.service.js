const mongoose = require('mongoose');
const ApiError = require('../../utils/ApiError');
const { Application, toPublicApplication } = require('./application.model');
const { Job, toPublicJob } = require('../jobs/job.model');
const { Employer } = require('../employers/employer.model');
const { User } = require('../users/user.model');
const { Profile } = require('../profiles/profile.model');
const {
  copyCombinedDocument,
  removeStoredDocument,
  readStoredDocument,
  sanitizeDownloadName,
} = require('./applicationDocument');

const isDeadlinePassed = (deadline) => {
  if (!deadline) {
    return false;
  }

  const end = new Date(deadline);
  end.setHours(23, 59, 59, 999);
  return Date.now() > end.getTime();
};

const getEmployerForUser = async (userId) => {
  const employer = await Employer.findOne({ userId });
  if (!employer) {
    throw new ApiError(403, 'You do not have permission to perform this action', 'FORBIDDEN');
  }
  return employer;
};

const decorate = async (application) => {
  const job = await Job.findById(application.jobId);
  const employer = job ? await Employer.findById(job.employerId) : null;
  const candidate = await User.findById(application.candidateId);
  const profile = await Profile.findOne({ userId: application.candidateId });

  return toPublicApplication(application, {
    job: job ? toPublicJob(job, employer) : null,
    candidate: candidate
      ? { _id: candidate._id, name: candidate.name, email: candidate.email }
      : null,
    profile: profile
      ? {
          skills: profile.skills || [],
          phone: profile.phone || '',
          location: profile.location || { country: '', city: '' },
          cvUrl: profile.cvUrl || '',
        }
      : null,
  });
};

const applyToJob = async (jobId, userId, input) => {
  if (!mongoose.isValidObjectId(jobId)) {
    throw new ApiError(404, 'Job not found', 'NOT_FOUND');
  }

  const job = await Job.findById(jobId);
  if (!job || job.status !== 'published') {
    throw new ApiError(404, 'Job not found', 'NOT_FOUND');
  }

  if (isDeadlinePassed(job.deadline)) {
    throw new ApiError(403, 'The application deadline has passed', 'FORBIDDEN');
  }

  const existing = await Application.findOne({ jobId, candidateId: userId });
  if (existing) {
    throw new ApiError(409, 'You have already applied for this job', 'CONFLICT');
  }

  const profile = await Profile.findOne({ userId });
  if (!profile || (profile.verificationStatus || 'pending') !== 'approved') {
    throw new ApiError(403, 'EmpoweWithIT must verify your profile before you can apply', 'FORBIDDEN');
  }

  if (!profile.documentStoredName) {
    throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
      documents: 'Upload a combined PDF on your profile before you apply',
    });
  }

  const cvUrl = input.cvUrl || profile.cvUrl || '';

  try {
    const application = await Application.create({
      jobId,
      candidateId: userId,
      coverLetter: input.coverLetter,
      cvUrl,
      status: 'applied',
    });

    try {
      const copied = await copyCombinedDocument({
        fromKind: 'profiles',
        fromName: profile.documentStoredName,
        toKind: 'applications',
        toId: application._id,
      });
      application.documentStoredName = copied.storedName;
      application.documentOriginalName = profile.documentOriginalName;
      application.documentSize = profile.documentSize;
      application.documentUrl = copied.url || '';
      await application.save();
    } catch (error) {
      await removeStoredDocument(`${application._id}.pdf`);
      if (application.documentStoredName) {
        await removeStoredDocument(application.documentStoredName);
      }
      await Application.deleteOne({ _id: application._id });
      throw error;
    }

    return decorate(application);
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, 'You have already applied for this job', 'CONFLICT');
    }
    throw error;
  }
};

const getMyApplicationForJob = async (jobId, userId) => {
  const application = await Application.findOne({ jobId, candidateId: userId });
  return application ? decorate(application) : null;
};

const listMyApplications = async (userId) => {
  const applications = await Application.find({ candidateId: userId }).sort({ createdAt: -1 });
  return Promise.all(applications.map(decorate));
};

const listJobApplications = async (jobId, user) => {
  if (!mongoose.isValidObjectId(jobId)) {
    throw new ApiError(404, 'Job not found', 'NOT_FOUND');
  }

  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, 'Job not found', 'NOT_FOUND');
  }

  if (user.role === 'employer') {
    const employer = await getEmployerForUser(user._id);
    if (String(job.employerId) !== String(employer._id)) {
      throw new ApiError(403, 'You do not have permission to perform this action', 'FORBIDDEN');
    }
  }

  const applications = await Application.find({ jobId }).sort({ createdAt: -1 });
  return Promise.all(applications.map(decorate));
};

const listEmployerApplications = async (userId) => {
  const employer = await getEmployerForUser(userId);
  const jobs = await Job.find({ employerId: employer._id }).select('_id');
  const applications = await Application.find({ jobId: { $in: jobs.map((job) => job._id) } }).sort({
    createdAt: -1,
  });
  return Promise.all(applications.map(decorate));
};

const listAllApplications = async (status) => {
  const query = {};
  if (status) {
    query.status = status;
  }

  const applications = await Application.find(query).sort({ createdAt: -1 });
  return Promise.all(applications.map(decorate));
};

const updateStatus = async (id, user, status) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Application not found', 'NOT_FOUND');
  }

  const application = await Application.findById(id);
  if (!application) {
    throw new ApiError(404, 'Application not found', 'NOT_FOUND');
  }

  if (user.role === 'employer') {
    const employer = await getEmployerForUser(user._id);
    const job = await Job.findById(application.jobId);
    if (!job || String(job.employerId) !== String(employer._id)) {
      throw new ApiError(403, 'You do not have permission to perform this action', 'FORBIDDEN');
    }
  }

  application.status = status;
  await application.save();
  return decorate(application);
};

const countApplicationsForEmployer = async (employerId) => {
  const jobs = await Job.find({ employerId }).select('_id');
  return Application.countDocuments({ jobId: { $in: jobs.map((job) => job._id) } });
};

const countApplicationsForCandidate = async (userId) => Application.countDocuments({ candidateId: userId });

const assertCanViewApplication = async (application, user) => {
  if (user.role === 'admin') {
    return;
  }

  if (user.role === 'job_seeker' && String(application.candidateId) === String(user._id)) {
    return;
  }

  if (user.role === 'employer') {
    const employer = await getEmployerForUser(user._id);
    const job = await Job.findById(application.jobId);
    if (job && String(job.employerId) === String(employer._id)) {
      return;
    }
  }

  throw new ApiError(403, 'You do not have permission to perform this action', 'FORBIDDEN');
};

const getApplicationDocument = async (id, user) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Application not found', 'NOT_FOUND');
  }

  const application = await Application.findById(id);
  if (!application) {
    throw new ApiError(404, 'Application not found', 'NOT_FOUND');
  }

  await assertCanViewApplication(application, user);

  if (!application.documentStoredName) {
    throw new ApiError(404, 'No combined document was uploaded for this application', 'NOT_FOUND');
  }

  const stored = await readStoredDocument('applications', application.documentStoredName);
  if (!stored) {
    throw new ApiError(404, 'No combined document was uploaded for this application', 'NOT_FOUND');
  }

  return {
    ...stored,
    downloadName: sanitizeDownloadName(application.documentOriginalName || 'combined-documents.pdf'),
  };
};

module.exports = {
  applyToJob,
  getMyApplicationForJob,
  listMyApplications,
  listJobApplications,
  listEmployerApplications,
  listAllApplications,
  updateStatus,
  getApplicationDocument,
  countApplicationsForEmployer,
  countApplicationsForCandidate,
};
