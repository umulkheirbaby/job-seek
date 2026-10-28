const request = require('supertest');
const bcrypt = require('bcryptjs');
const { PDFDocument, StandardFonts } = require('pdf-lib');
const app = require('../src/app');
const { User } = require('../src/modules/users/user.model');

const api = () => request.agent(app);

const registerUser = (agent, overrides = {}) =>
  agent.post('/api/v1/auth/register').send({
    name: 'Amina Yusuf',
    email: `seeker.${Date.now()}@example.com`,
    password: 'Password123',
    role: 'job_seeker',
    ...overrides,
  });

const createAdmin = async () => {
  const email = `admin.${Date.now()}@empoweewithit.local`;
  await User.create({
    name: 'EmpoweWithIT Admin',
    email,
    password: await bcrypt.hash('Admin12345', 10),
    role: 'admin',
    status: 'active',
  });
  return { email, password: 'Admin12345' };
};

const login = (agent, email, password) =>
  agent.post('/api/v1/auth/login').send({ email, password });

const makePdf = async (text) => {
  const doc = await PDFDocument.create();
  const page = doc.addPage([400, 200]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText(text, { x: 24, y: 100, size: 18, font });
  return Buffer.from(await doc.save());
};

module.exports = { api, registerUser, createAdmin, login, makePdf };
