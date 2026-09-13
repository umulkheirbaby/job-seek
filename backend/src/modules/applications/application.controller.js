const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const { validateApply, validateStatus } = require('./application.validation');
const applicationService = require('./application.service');

const apply = asyncHandler(async (req, res) => {
  const input = validateApply(req.body);
  const application = await applicationService.applyToJob(req.params.id, req.user._id, input);

  sendSuccess(res, {
    statusCode: 201,
    message: 'Application submitted successfully',
    data: { application },
  });
});

const getMineForJob = asyncHandler(async (req, res) => {
  const application = await applicationService.getMyApplicationForJob(req.params.id, req.user._id);

  sendSuccess(res, {
    message: application ? 'Application loaded' : 'No application yet',
    data: { application },
  });
});

const list = asyncHandler(async (req, res) => {
  let applications = [];

  if (req.user.role === 'job_seeker') {
    applications = await applicationService.listMyApplications(req.user._id);
  } else if (req.user.role === 'employer') {
    applications = await applicationService.listEmployerApplications(req.user._id);
  } else if (req.user.role === 'admin') {
    applications = await applicationService.listAllApplications(req.query.status);
  }

  sendSuccess(res, {
    message: 'Applications loaded',
    data: { applications },
  });
});

const listForJob = asyncHandler(async (req, res) => {
  const applications = await applicationService.listJobApplications(req.params.id, req.user);

  sendSuccess(res, {
    message: 'Applications loaded',
    data: { applications },
  });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status } = validateStatus(req.body);
  const application = await applicationService.updateStatus(req.params.id, req.user, status);

  sendSuccess(res, {
    message: `Application marked as ${status}`,
    data: { application },
  });
});

module.exports = { apply, getMineForJob, list, listForJob, updateStatus };
