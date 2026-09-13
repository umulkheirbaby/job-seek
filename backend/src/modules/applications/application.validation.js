const ApiError = require('../../utils/ApiError');
const { APPLICATION_STATUSES } = require('./application.model');

const URL_PATTERN = /^https?:\/\/.+/i;

const validateApply = (body = {}) => {
  const coverLetter = typeof body.coverLetter === 'string' ? body.coverLetter.trim() : '';
  const cvUrl = typeof body.cvUrl === 'string' ? body.cvUrl.trim() : '';

  if (coverLetter.length > 4000) {
    throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
      coverLetter: 'Cover letter must be 4000 characters or fewer',
    });
  }

  if (cvUrl && !URL_PATTERN.test(cvUrl)) {
    throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
      cvUrl: 'Use a full URL starting with http:// or https://',
    });
  }

  return { coverLetter, cvUrl };
};

const validateStatus = (body = {}) => {
  const status = typeof body.status === 'string' ? body.status : '';
  if (!APPLICATION_STATUSES.includes(status)) {
    throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
      status: 'Choose a valid application status',
    });
  }

  return { status };
};

module.exports = { validateApply, validateStatus };
