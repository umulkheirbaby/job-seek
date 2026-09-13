const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const { validateProfileUpdate, validateVerification } = require('./profile.validation');
const profileService = require('./profile.service');

const getMe = asyncHandler(async (req, res) => {
  const data = await profileService.getMyProfile(req.user._id);

  sendSuccess(res, {
    message: 'Profile loaded',
    data,
  });
});

const updateMe = asyncHandler(async (req, res) => {
  const input = validateProfileUpdate(req.body);
  const data = await profileService.updateMyProfile(req.user._id, input);

  sendSuccess(res, {
    message: 'Profile updated',
    data,
  });
});

const getPublic = asyncHandler(async (req, res) => {
  const data = await profileService.getPublicProfile(req.params.id);

  sendSuccess(res, {
    message: 'Public profile loaded',
    data,
  });
});

const list = asyncHandler(async (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
  const jobSeekers = await profileService.listJobSeekers(status || undefined);

  sendSuccess(res, {
    message: 'Job seekers loaded',
    data: { jobSeekers },
  });
});

const verify = asyncHandler(async (req, res) => {
  const input = validateVerification(req.body);
  const data = await profileService.verifyJobSeeker(req.params.id, input);
  const labels = {
    approved: 'Job seeker approved',
    rejected: 'Job seeker rejected',
    suspended: 'Job seeker suspended',
  };

  sendSuccess(res, {
    message: labels[input.verificationStatus],
    data,
  });
});

module.exports = { getMe, updateMe, getPublic, list, verify };
