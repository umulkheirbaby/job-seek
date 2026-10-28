const cloudinary = require('cloudinary').v2;
const { env } = require('./env');

const isCloudinaryEnabled = () =>
  Boolean(env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret);

if (isCloudinaryEnabled()) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
  });
}

const publicIdFor = (kind, id) => `empoweewithit/${kind}/${id}`;

module.exports = { cloudinary, isCloudinaryEnabled, publicIdFor };
