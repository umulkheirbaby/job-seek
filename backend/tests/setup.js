const mongoose = require('mongoose');
const { connectDatabase } = require('../src/config/database');

beforeAll(async () => {
  await connectDatabase();
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
});
