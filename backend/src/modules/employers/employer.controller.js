const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const { validateEmployerUpdate, validateVerification } = require('./employer.validation');
const employerService = require('./employer.service');

const getMe = asyncHandler(async (req, res) => {
  const data = await employerService.getMyEmployer(req.user._id);

  sendSuccess(res, {
    message: 'Company profile loaded',
    data,
  });
});

const updateMe = asyncHandler(async (req, res) => {
  const input = validateEmployerUpdate(req.body);
  const data = await employerService.updateMyEmployer(req.user._id, input);

  sendSuccess(res, {
    message: 'Company profile updated',
    data,
  });
});

const getPublic = asyncHandler(async (req, res) => {
  const data = await employerService.getPublicEmployer(req.params.id);

  sendSuccess(res, {
    message: 'Employer loaded',
    data,
  });
});

const list = asyncHandler(async (req, res) => {
  const data = await employerService.listEmployers(req.query.status);

  sendSuccess(res, {
    message: 'Employers loaded',
    data: { employers: data },
  });
});

const verify = asyncHandler(async (req, res) => {
  const input = validateVerification(req.body);
  const data = await employerService.verifyEmployer(req.params.id, input);
  const labels = {
    approved: 'Employer approved',
    rejected: 'Employer rejected',
    suspended: 'Employer suspended',
  };

  sendSuccess(res, {
    message: labels[input.verificationStatus],
    data,
  });
});

module.exports = { getMe, updateMe, getPublic, list, verify };
