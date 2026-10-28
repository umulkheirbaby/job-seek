const path = require('path');
const os = require('os');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-not-for-production';
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/ilo-job-linkage-test';
process.env.CLIENT_ORIGIN = 'http://localhost:5174';
process.env.ADMIN_EMAIL = '';
process.env.ADMIN_PASSWORD = '';
process.env.UPLOAD_DIR = path.join(os.tmpdir(), 'empoweewithit-test-uploads');
process.env.CLOUDINARY_CLOUD_NAME = '';
process.env.CLOUDINARY_API_KEY = '';
process.env.CLOUDINARY_API_SECRET = '';


