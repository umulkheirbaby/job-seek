const express = require('express');
const requireAuth = require('../../middleware/requireAuth');
const authorize = require('../../middleware/authorize');
const { getMe, updateMe, getPublic } = require('./profile.controller');

const router = express.Router();

router.get('/profile', requireAuth, authorize('job_seeker'), getMe);
router.patch('/profile', requireAuth, authorize('job_seeker'), updateMe);
router.get('/job-seekers/:id', getPublic);

module.exports = router;
