const { connectDatabase } = require('./config/database');
const { env } = require('./config/env');
const { seedAdmin } = require('./scripts/seedAdmin');
const app = require('./app');

const start = async () => {
  try {
    await connectDatabase();
    try {
      await seedAdmin();
    } catch (seedError) {
      console.error(`Admin seed failed: ${seedError.message}`);
    }
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.error('API will start without a database. Check MONGODB_URI and try again.');
  }

  const server = app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${env.port} is already in use. Set PORT in backend/.env to a free port.`);
      process.exit(1);
    }

    throw error;
  });
};

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
