const express = require('express');
const requireAuth = require('../../middleware/requireAuth');
const authorize = require('../../middleware/authorize');
const uploadApplicationDocuments = require('../../middleware/uploadApplicationDocuments');
const { getMe, updateMe, getPublic, uploadDocument, downloadDocument } = require('./profile.controller');

const router = express.Router();

router.get('/profile', requireAuth, authorize('job_seeker'), getMe);
router.patch('/profile', requireAuth, authorize('job_seeker'), updateMe);
router.post(
  '/profile/document',
  requireAuth,
  authorize('job_seeker'),
  uploadApplicationDocuments,
  uploadDocument
);
router.get('/profile/document', requireAuth, authorize('job_seeker'), downloadDocument);
router.get('/job-seekers/:id', getPublic);

module.exports = router;
