const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const { sendSuccess } = require('../../utils/apiResponse');
const { APPLICATION_STATUSES } = require('../applications/application.model');
const employerController = require('../employers/employer.controller');
const profileController = require('../profiles/profile.controller');
const jobController = require('../jobs/job.controller');
const applicationService = require('../applications/application.service');
const adminService = require('./admin.service');
const userService = require('../users/user.service');
const { validateUserQuery, validateUserStatus } = require('../users/user.validation');

const getAdminHealth = asyncHandler(async (req, res) => {
  sendSuccess(res, {
    message: 'Admin access confirmed',
    data: {
      user: req.user,
      scope: 'admin',
    },
  });
});

const getDashboard = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboard();

  sendSuccess(res, {
    message: 'Programme statistics loaded',
    data: { stats },
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const query = validateUserQuery(req.query);
  const users = await userService.listUsers(query);

  sendSuccess(res, {
    message: 'Users loaded',
    data: { users },
  });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = validateUserStatus(req.body);
  const user = await userService.updateUserStatus(req.params.id, req.user, status);
  const labels = {
    active: 'User reactivated',
    inactive: 'User deactivated',
    suspended: 'User suspended',
  };

  sendSuccess(res, {
    message: labels[status],
    data: { user },
  });
});

const listApplications = asyncHandler(async (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
  if (status && !APPLICATION_STATUSES.includes(status)) {
    throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
      status: 'Choose a valid application status',
    });
  }

  const applications = await applicationService.listAllApplications(status || undefined);

  sendSuccess(res, {
    message: 'Applications loaded',
    data: { applications },
  });
});

module.exports = {
  getAdminHealth,
  getDashboard,
  listUsers,
  updateUserStatus,
  listApplications,
  listEmployers: employerController.list,
  verifyEmployer: employerController.verify,
  listJobSeekers: profileController.list,
  verifyJobSeeker: profileController.verify,
  downloadJobSeekerDocument: profileController.downloadJobSeekerDocument,
  listJobs: jobController.listAdmin,
  reviewJob: jobController.review,
};
