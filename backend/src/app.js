const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { env } = require('./config/env');
const healthRoutes = require('./modules/health/health.routes');
const authRoutes = require('./modules/auth/auth.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const profileRoutes = require('./modules/profiles/profile.routes');
const employerRoutes = require('./modules/employers/employer.routes');
const jobRoutes = require('./modules/jobs/job.routes');
const applicationRoutes = require('./modules/applications/application.routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

if (env.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

const corsOrigin = (origin, callback) => {
  if (!origin) {
    return callback(null, true);
  }

  if (env.nodeEnv === 'development' && /^https?:\/\/localhost:\d+$/.test(origin)) {
    return callback(null, true);
  }

  if (origin === env.clientOrigin) {
    return callback(null, true);
  }

  return callback(new Error('Not allowed by CORS'));
};

app.use(helmet());
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  if (env.nodeEnv === 'development') {
    console.log(`${req.method} ${req.originalUrl}`);
  }
  next();
});

app.get('/api/v1', (req, res) => {
  res.json({
    success: true,
    message: 'EmpoweWithIT Job Linkage API',
    data: {
      name: 'EmpoweWithIT Job Linkage API',
      version: 'v1',
      sprint: 8,
    },
  });
});

app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/employers', employerRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1', profileRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
