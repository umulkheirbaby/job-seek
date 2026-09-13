const ApiError = require('../../utils/ApiError');
const { VERIFICATION_STATUSES } = require('./profile.model');

const URL_PATTERN = /^https?:\/\/.+/i;

const optionalDate = (value) => {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const sanitizeSkills = (skills) => {
  if (skills === undefined) {
    return undefined;
  }

  if (!Array.isArray(skills)) {
    throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
      skills: 'Skills must be a list',
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

  if (unique.length > 30) {
    throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
      skills: 'Add no more than 30 skills',
    });
  }

  return unique;
};

const sanitizeEducation = (education) => {
  if (education === undefined) {
    return undefined;
  }

  if (!Array.isArray(education)) {
    throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
      education: 'Education must be a list',
    });
  }

  return education
    .map((item) => ({
      institution: typeof item.institution === 'string' ? item.institution.trim() : '',
      qualification: typeof item.qualification === 'string' ? item.qualification.trim() : '',
      field: typeof item.field === 'string' ? item.field.trim() : '',
      startDate: optionalDate(item.startDate),
      endDate: optionalDate(item.endDate),
    }))
    .filter((item) => item.institution || item.qualification || item.field)
    .map((item) => {
      if (!item.institution) {
        throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
          education: 'Each education entry needs an institution',
        });
      }
      if (item.startDate === null || item.endDate === null) {
        throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
          education: 'Education dates must be valid',
        });
      }
      return item;
    });
};

const sanitizeExperience = (experience) => {
  if (experience === undefined) {
    return undefined;
  }

  if (!Array.isArray(experience)) {
    throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
      experience: 'Experience must be a list',
    });
  }

  return experience
    .map((item) => ({
      company: typeof item.company === 'string' ? item.company.trim() : '',
      position: typeof item.position === 'string' ? item.position.trim() : '',
      description: typeof item.description === 'string' ? item.description.trim() : '',
      startDate: optionalDate(item.startDate),
      endDate: optionalDate(item.endDate),
    }))
    .filter((item) => item.company || item.position || item.description)
    .map((item) => {
      if (!item.company || !item.position) {
        throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
          experience: 'Each experience entry needs a company and position',
        });
      }
      if (item.startDate === null || item.endDate === null) {
        throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
          experience: 'Experience dates must be valid',
        });
      }
      return item;
    });
};

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

const validateProfileUpdate = (body = {}) => {
  const update = {};

  if (body.phone !== undefined) {
    update.phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  }

  if (body.bio !== undefined) {
    const bio = typeof body.bio === 'string' ? body.bio.trim() : '';
    if (bio.length > 2000) {
      throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
        bio: 'Bio must be 2000 characters or fewer',
      });
    }
    update.bio = bio;
  }

  if (body.location !== undefined) {
    update.location = {
      country: typeof body.location?.country === 'string' ? body.location.country.trim() : '',
      city: typeof body.location?.city === 'string' ? body.location.city.trim() : '',
    };
  }

  const skills = sanitizeSkills(body.skills);
  if (skills !== undefined) {
    update.skills = skills;
  }

  const education = sanitizeEducation(body.education);
  if (education !== undefined) {
    update.education = education;
  }

  const experience = sanitizeExperience(body.experience);
  if (experience !== undefined) {
    update.experience = experience;
  }

  const cvUrl = optionalUrl(body.cvUrl, 'cvUrl');
  if (cvUrl !== undefined) {
    update.cvUrl = cvUrl;
  }

  const portfolioUrl = optionalUrl(body.portfolioUrl, 'portfolioUrl');
  if (portfolioUrl !== undefined) {
    update.portfolioUrl = portfolioUrl;
  }

  return update;
};

const text = (value) => (typeof value === 'string' ? value.trim() : '');

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

module.exports = { validateProfileUpdate, validateVerification };
