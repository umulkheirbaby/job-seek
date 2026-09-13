const express = require('express');
const requireAuth = require('../../middleware/requireAuth');
const authorize = require('../../middleware/authorize');
const { list, updateStatus } = require('./application.controller');

const router = express.Router();

router.get('/', requireAuth, list);
router.patch('/:id/status', requireAuth, authorize('employer', 'admin'), updateStatus);

module.exports = router;
