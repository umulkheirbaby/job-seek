const mongoose = require('mongoose');
const ApiError = require('../../utils/ApiError');
const { User } = require('../users/user.model');
const { Profile, computeProfileStats, toPublicProfile } = require('./profile.model');
const { saveCombinedDocument, readStoredDocument, sanitizeDownloadName } = require('../../utils/combinedPdf');

const ensureProfile = async (userId) => {
  let profile = await Profile.findOne({ userId });
  if (!profile) {
    profile = await Profile.create({ userId });
  }
  return profile;
};

const getMyProfile = async (userId) => {
  const profile = await ensureProfile(userId);
  return {
    profile: toPublicProfile(profile),
    stats: computeProfileStats(profile),
  };
};

const updateMyProfile = async (userId, input) => {
  const profile = await ensureProfile(userId);
  Object.assign(profile, input);
  await profile.save();

  return {
    profile: toPublicProfile(profile),
    stats: computeProfileStats(profile),
  };
};

const listJobSeekers = async (status) => {
  const query = {};
  if (status === 'pending') {
    query.$or = [{ verificationStatus: 'pending' }, { verificationStatus: { $exists: false } }];
  } else if (status) {
    query.verificationStatus = status;
  }

  const profiles = await Profile.find(query).sort({ createdAt: -1 });
  const users = await User.find({ _id: { $in: profiles.map((item) => item.userId) }, role: 'job_seeker' });
  const usersById = new Map(users.map((user) => [String(user._id), user]));

  return profiles
    .filter((profile) => usersById.has(String(profile.userId)))
    .map((profile) => {
      const user = usersById.get(String(profile.userId));
      return {
        profile: toPublicProfile(profile),
        user: { _id: user._id, name: user.name, email: user.email, status: user.status },
        stats: computeProfileStats(profile),
      };
    });
};

const verifyJobSeeker = async (id, input) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Job seeker not found', 'NOT_FOUND');
  }

  const profile = await Profile.findById(id);
  if (!profile) {
    throw new ApiError(404, 'Job seeker not found', 'NOT_FOUND');
  }

  profile.verificationStatus = input.verificationStatus;
  profile.verificationNote = input.verificationNote;
  await profile.save();

  return {
    profile: toPublicProfile(profile),
    stats: computeProfileStats(profile),
  };
};

const saveMyDocument = async (userId, files) => {
  const profile = await ensureProfile(userId);
  const saved = await saveCombinedDocument('profiles', profile._id, files);
  profile.documentStoredName = saved.storedName;
  profile.documentOriginalName = saved.originalName;
  profile.documentSize = saved.size;
  profile.documentUrl = saved.url || '';
  await profile.save();

  return {
    profile: toPublicProfile(profile),
    stats: computeProfileStats(profile),
  };
};

const getMyDocument = async (userId) => {
  const profile = await ensureProfile(userId);
  return getProfileDocumentFile(profile);
};

const getJobSeekerDocument = async (profileId) => {
  if (!mongoose.isValidObjectId(profileId)) {
    throw new ApiError(404, 'Job seeker not found', 'NOT_FOUND');
  }

  const profile = await Profile.findById(profileId);
  if (!profile) {
    throw new ApiError(404, 'Job seeker not found', 'NOT_FOUND');
  }

  return getProfileDocumentFile(profile);
};

const getProfileDocumentFile = async (profile) => {
  if (!profile.documentStoredName) {
    throw new ApiError(404, 'No combined document was uploaded for this profile', 'NOT_FOUND');
  }

  const stored = await readStoredDocument('profiles', profile.documentStoredName);
  if (!stored) {
    throw new ApiError(404, 'No combined document was uploaded for this profile', 'NOT_FOUND');
  }

  return {
    ...stored,
    downloadName: sanitizeDownloadName(profile.documentOriginalName || 'combined-documents.pdf'),
  };
};

const getPublicProfile = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(404, 'Job seeker not found', 'NOT_FOUND');
  }

  const user = await User.findById(userId);
  if (!user || user.role !== 'job_seeker' || user.status !== 'active') {
    throw new ApiError(404, 'Job seeker not found', 'NOT_FOUND');
  }

  const profile = await Profile.findOne({ userId });
  if (!profile) {
    throw new ApiError(404, 'Job seeker not found', 'NOT_FOUND');
  }

  return {
    user: {
      _id: user._id,
      name: user.name,
      role: user.role,
    },
    profile: toPublicProfile(profile),
    stats: computeProfileStats(profile),
  };
};

module.exports = {
  ensureProfile,
  getMyProfile,
  updateMyProfile,
  saveMyDocument,
  getMyDocument,
  getJobSeekerDocument,
  getPublicProfile,
  listJobSeekers,
  verifyJobSeeker,
};
