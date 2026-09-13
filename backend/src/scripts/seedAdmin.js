const bcrypt = require('bcryptjs');
const { env } = require('../config/env');
const { User } = require('../modules/users/user.model');

const seedAdmin = async () => {
  if (!env.adminEmail || !env.adminPassword) {
    return;
  }

  const existing = await User.findOne({ email: env.adminEmail });
  if (existing) {
    return;
  }

  await User.create({
    name: 'ILO Admin',
    email: env.adminEmail,
    password: await bcrypt.hash(env.adminPassword, 10),
    role: 'admin',
    status: 'active',
    emailVerified: true,
  });

  console.log(`Seeded admin account ${env.adminEmail}`);
};

module.exports = { seedAdmin };
