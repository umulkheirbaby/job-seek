const ApiError = require('../../utils/ApiError');
const { VERIFICATION_STATUSES } = require('./employer.model');

const WEBSITE_PATTERN = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i;

const optionalWebsite = (value) => {
  if (value === undefined) {
    return undefined;
  }

  const website = typeof value === 'string' ? value.trim() : '';
  if (!website) {
    return '';
  }

  if (!WEBSITE_PATTERN.test(website)) {
    throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
      website: 'Enter a valid website, with or without https://',
    });
  }

  return website;
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

  const website = optionalWebsite(body.website);
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
