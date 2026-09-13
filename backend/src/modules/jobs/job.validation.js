const ApiError = require('../../utils/ApiError');
const { EMPLOYMENT_TYPES, WORK_TYPES, EXPERIENCE_LEVELS, JOB_STATUSES } = require('./job.model');

const text = (value) => (typeof value === 'string' ? value.trim() : '');

const uniqueSkills = (skills) => {
  if (skills === undefined) {
    return undefined;
  }

  if (!Array.isArray(skills)) {
    throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
      skills: 'At least one skill is required',
    });
  }

  const unique = [];
  const seen = new Set();
  skills.forEach((skill) => {
    const name = typeof skill === 'string' ? skill.trim() : '';
    const key = name.toLowerCase();
    if (name && !seen.has(key)) {
      seen.add(key);
      unique.push(name);
    }
  });

  return unique;
};

const optionalDate = (value) => {
  if (value === undefined) {
    return undefined;
  }
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const optionalNumber = (value) => {
  if (value === undefined || value === '' || value === null) {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const validateJobInput = (body = {}, { partial = false } = {}) => {
  const errors = {};
  const update = {};

  if (!partial || body.title !== undefined) {
    update.title = text(body.title);
    if (!update.title) {
      errors.title = 'Job title is required';
    }
  }

  if (!partial || body.description !== undefined) {
    update.description = text(body.description);
    if (!update.description) {
      errors.description = 'Job description is required';
    }
  }

  if (!partial || body.employmentType !== undefined) {
    update.employmentType = text(body.employmentType);
    if (!EMPLOYMENT_TYPES.includes(update.employmentType)) {
      errors.employmentType = 'Choose a valid employment type';
    }
  }

  if (!partial || body.workType !== undefined) {
    update.workType = text(body.workType);
    if (!WORK_TYPES.includes(update.workType)) {
      errors.workType = 'Choose remote, hybrid, or onsite';
    }
  }

  if (!partial || body.experienceLevel !== undefined) {
    update.experienceLevel = text(body.experienceLevel) || 'junior';
    if (!EXPERIENCE_LEVELS.includes(update.experienceLevel)) {
      errors.experienceLevel = 'Choose junior, mid, or senior';
    }
  }

  if (!partial || body.skills !== undefined) {
    update.skills = uniqueSkills(body.skills) || [];
    if (update.skills.length === 0) {
      errors.skills = 'At least one skill is required';
    }
  }

  if (!partial || body.location !== undefined) {
    update.location = {
      country: text(body.location?.country),
      city: text(body.location?.city),
    };
  }

  if (!partial || body.salary !== undefined) {
    update.salary = {
      min: optionalNumber(body.salary?.min),
      max: optionalNumber(body.salary?.max),
      currency: text(body.salary?.currency) || 'USD',
    };
  }

  if (!partial || body.deadline !== undefined) {
    const deadline = optionalDate(body.deadline);
    if (body.deadline && deadline === null) {
      errors.deadline = 'Deadline must be a valid date';
    } else {
      update.deadline = deadline;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', errors);
  }

  return update;
};

const validateJobReview = (body = {}) => {
  const status = text(body.status);
  if (!['published', 'rejected'].includes(status) && !JOB_STATUSES.includes(status)) {
    throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
      status: 'Status must be published or rejected',
    });
  }

  if (!['published', 'rejected'].includes(status)) {
    throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
      status: 'Status must be published or rejected',
    });
  }

  return {
    status,
    reviewNote: text(body.reviewNote),
  };
};

module.exports = { validateJobInput, validateJobReview };
