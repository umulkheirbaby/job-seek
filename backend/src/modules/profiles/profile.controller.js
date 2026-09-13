const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const { validateProfileUpdate } = require('./profile.validation');
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

module.exports = { getMe, updateMe, getPublic };
