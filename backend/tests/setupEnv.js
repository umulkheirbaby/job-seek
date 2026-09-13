process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-not-for-production';
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/ilo-job-linkage-test';
process.env.CLIENT_ORIGIN = 'http://localhost:5174';
process.env.ADMIN_EMAIL = '';
process.env.ADMIN_PASSWORD = '';
