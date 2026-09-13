const express = require('express');
const requireAuth = require('../../middleware/requireAuth');
const optionalAuth = require('../../middleware/optionalAuth');
const authorize = require('../../middleware/authorize');
const { create, list, listMine, getOne, update, remove } = require('./job.controller');
const {
  apply,
  getMineForJob,
  listForJob,
} = require('../applications/application.controller');

const router = express.Router();

router.get('/', list);
router.get('/mine', requireAuth, authorize('employer'), listMine);
router.post('/:id/apply', requireAuth, authorize('job_seeker'), apply);
router.get('/:id/my-application', requireAuth, authorize('job_seeker'), getMineForJob);
router.get('/:id/applications', requireAuth, authorize('employer', 'admin'), listForJob);
router.get('/:id', optionalAuth, getOne);
router.post('/', requireAuth, authorize('employer'), create);
router.patch('/:id', requireAuth, authorize('employer'), update);
router.delete('/:id', requireAuth, authorize('employer'), remove);

module.exports = router;
