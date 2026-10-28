const fs = require('fs');
const path = require('path');
const { env } = require('./env');

const MAX_FILES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const getUploadRoot = () => path.resolve(env.uploadDir);

const getKindDir = (kind = 'applications') =>
  path.join(getUploadRoot(), kind === 'profiles' ? 'profiles' : 'applications');

const ensureKindDir = (kind = 'applications') => {
  const dir = getKindDir(kind);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const getApplicationsDir = () => getKindDir('applications');
const getProfilesDir = () => getKindDir('profiles');
const ensureApplicationsDir = () => ensureKindDir('applications');

const storedDocumentPath = (kind, storedName) => {
  const safeName = path.basename(storedName || '');
  const root = ensureKindDir(kind);
  const resolved = path.resolve(root, safeName);
  const prefix = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
  if (!resolved.startsWith(prefix)) {
    throw new Error('Invalid document path');
  }
  return resolved;
};

module.exports = {
  MAX_FILES,
  MAX_FILE_SIZE,
  getUploadRoot,
  getKindDir,
  ensureKindDir,
  getApplicationsDir,
  getProfilesDir,
  ensureApplicationsDir,
  storedDocumentPath,
};
