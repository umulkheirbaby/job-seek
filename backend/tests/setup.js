const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { connectDatabase } = require('../src/config/database');
const { getApplicationsDir, getProfilesDir } = require('../src/config/uploads');

const clearUploadedPdfs = () => {
  [getApplicationsDir(), getProfilesDir()].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      return;
    }

    fs.readdirSync(dir)
      .filter((file) => file.endsWith('.pdf'))
      .forEach((file) => fs.unlinkSync(path.join(dir, file)));
  });
};

beforeAll(async () => {
  await connectDatabase();
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
  clearUploadedPdfs();
});

afterAll(async () => {
  await mongoose.disconnect();
});
