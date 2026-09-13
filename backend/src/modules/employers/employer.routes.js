const express = require('express');
const requireAuth = require('../../middleware/requireAuth');
const authorize = require('../../middleware/authorize');
const { getMe, updateMe, getPublic } = require('./employer.controller');

const router = express.Router();

router.get('/me', requireAuth, authorize('employer'), getMe);
router.patch('/me', requireAuth, authorize('employer'), updateMe);
router.get('/:id', getPublic);

module.exports = router;
