const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const { validateJobInput, validateJobReview } = require('./job.validation');
const jobService = require('./job.service');

const create = asyncHandler(async (req, res) => {
  const input = validateJobInput(req.body);
  const job = await jobService.createJob(req.user._id, input);

  sendSuccess(res, {
    statusCode: 201,
    message: 'Job submitted for EmpoweWithIT review',
    data: { job },
  });
});

const list = asyncHandler(async (req, res) => {
  const jobs = await jobService.listPublishedJobs(req.query);

  sendSuccess(res, {
    message: 'Jobs loaded',
    data: { jobs },
  });
});

const listMine = asyncHandler(async (req, res) => {
  const jobs = await jobService.listMyJobs(req.user._id);

  sendSuccess(res, {
    message: 'Your jobs loaded',
    data: { jobs },
  });
});

const listAdmin = asyncHandler(async (req, res) => {
  const jobs = await jobService.listJobsForAdmin(req.query.status);

  sendSuccess(res, {
    message: 'Jobs loaded',
    data: { jobs },
  });
});

const getOne = asyncHandler(async (req, res) => {
  const job = await jobService.getJobById(req.params.id, req.user);

  sendSuccess(res, {
    message: 'Job loaded',
    data: { job },
  });
});

const update = asyncHandler(async (req, res) => {
  const input = validateJobInput(req.body, { partial: true });
  const job = await jobService.updateJob(req.params.id, req.user._id, input);

  sendSuccess(res, {
    message: job.status === 'pending' ? 'Job updated and sent back for review' : 'Job updated',
    data: { job },
  });
});

const remove = asyncHandler(async (req, res) => {
  const job = await jobService.removeJob(req.params.id, req.user._id);
  const message = job.status === 'closed' ? 'Job closed' : 'Job removed';

  sendSuccess(res, {
    message,
    data: { job },
  });
});

const review = asyncHandler(async (req, res) => {
  const input = validateJobReview(req.body);
  const job = await jobService.reviewJob(req.params.id, input);
  const message = input.status === 'published' ? 'Job approved and published' : 'Job rejected';

  sendSuccess(res, {
    message,
    data: { job },
  });
});

module.exports = { create, list, listMine, listAdmin, getOne, update, remove, review };
