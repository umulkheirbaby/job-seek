const express = require('express');
const requireAuth = require('../../middleware/requireAuth');
const authorize = require('../../middleware/authorize');
const {
  getAdminHealth,
  getDashboard,
  listUsers,
  updateUserStatus,
  listApplications,
  listEmployers,
  verifyEmployer,
  listJobSeekers,
  verifyJobSeeker,
  downloadJobSeekerDocument,
  listJobs,
  reviewJob,
} = require('./admin.controller');

const router = express.Router();

router.use(requireAuth, authorize('admin'));

router.get('/health', getAdminHealth);
router.get('/dashboard', getDashboard);
router.get('/users', listUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/applications', listApplications);
router.get('/job-seekers', listJobSeekers);
router.get('/job-seekers/:id/document', downloadJobSeekerDocument);
router.patch('/job-seekers/:id/verify', verifyJobSeeker);
router.get('/employers', listEmployers);
router.patch('/employers/:id/verify', verifyEmployer);
router.get('/jobs', listJobs);
router.patch('/jobs/:id/approve', reviewJob);

module.exports = router;
