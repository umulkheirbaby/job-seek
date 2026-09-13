const ApiError = require('../../utils/ApiError');
const { VERIFICATION_STATUSES } = require('./employer.model');

const URL_PATTERN = /^https?:\/\/.+/i;

const optionalUrl = (value, field) => {
  if (value === undefined) {
    return undefined;
  }

  const url = typeof value === 'string' ? value.trim() : '';
  if (!url) {
    return '';
  }

  if (!URL_PATTERN.test(url)) {
    throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
      [field]: 'Use a full URL starting with http:// or https://',
    });
  }

  return url;
};

const text = (value) => (typeof value === 'string' ? value.trim() : '');

const validateEmployerUpdate = (body = {}) => {
  const update = {};

  if (body.companyName !== undefined) {
    update.companyName = text(body.companyName);
  }

  if (body.description !== undefined) {
    const description = text(body.description);
    if (description.length > 3000) {
      throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
        description: 'Description must be 3000 characters or fewer',
      });
    }
    update.description = description;
  }

  const website = optionalUrl(body.website, 'website');
  if (website !== undefined) {
    update.website = website;
  }

  if (body.industry !== undefined) {
    update.industry = text(body.industry);
  }

  if (body.country !== undefined) {
    update.country = text(body.country);
  }

  if (body.city !== undefined) {
    update.city = text(body.city);
  }

  return update;
};

const validateVerification = (body = {}) => {
  const verificationStatus = typeof body.verificationStatus === 'string' ? body.verificationStatus : '';
  if (!VERIFICATION_STATUSES.includes(verificationStatus) || verificationStatus === 'pending') {
    throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
      verificationStatus: 'Status must be approved, rejected, or suspended',
    });
  }

  return {
    verificationStatus,
    verificationNote: text(body.verificationNote),
  };
};

module.exports = { validateEmployerUpdate, validateVerification };
