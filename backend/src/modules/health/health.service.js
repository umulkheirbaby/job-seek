const mongoose = require('mongoose');
const { env } = require('../../config/env');

const CONNECTION_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

const getHealth = async () => {
  const readyState = mongoose.connection.readyState;
  const database = {
    status: CONNECTION_STATES[readyState] || 'unknown',
    name: mongoose.connection.name || null,
  };

  if (readyState === 1 && mongoose.connection.db) {
    await mongoose.connection.db.admin().ping();
  }

  return {
    status: readyState === 1 ? 'ok' : 'degraded',
    service: 'empoweewithit-job-linkage-api',
    sprint: 8,
    environment: env.nodeEnv,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database,
  };
};

module.exports = { getHealth };
