const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ilo-job-linkage',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: process.env.AUTH_COOKIE_NAME || 'empoweewithit_session',
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'),
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
};

if (env.nodeEnv === 'production') {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required in production');
  }
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required in production');
  }
  if (!process.env.CLIENT_ORIGIN) {
    throw new Error('CLIENT_ORIGIN is required in production');
  }
}

module.exports = { env };
