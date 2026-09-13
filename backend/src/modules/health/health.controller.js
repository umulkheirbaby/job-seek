const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const healthService = require('./health.service');

const getHealth = asyncHandler(async (req, res) => {
  const data = await healthService.getHealth();

  sendSuccess(res, {
    message: data.status === 'ok' ? 'API is healthy' : 'API is running but the database is unavailable',
    data,
  });
});

module.exports = { getHealth };
