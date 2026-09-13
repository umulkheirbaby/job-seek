const { User } = require('../users/user.model');
const { Employer } = require('../employers/employer.model');
const { Job } = require('../jobs/job.model');
const { Profile } = require('../profiles/profile.model');
const { Application, APPLICATION_STATUSES } = require('../applications/application.model');

const countBy = async (Model, field, values) => {
  const rows = await Model.aggregate([{ $group: { _id: `$${field}`, count: { $sum: 1 } } }]);
  const counts = Object.fromEntries(values.map((value) => [value, 0]));
  rows.forEach((row) => {
    if (row._id && counts[row._id] !== undefined) {
      counts[row._id] = row.count;
    }
  });
  return counts;
};

const getDashboard = async () => {
  const [
    totalUsers,
    usersByRole,
    usersByStatus,
    seekersByStatus,
    employersByStatus,
    jobsByStatus,
    remoteJobs,
    applicationsByStatus,
  ] = await Promise.all([
    User.countDocuments(),
    countBy(User, 'role', ['job_seeker', 'employer', 'admin']),
    countBy(User, 'status', ['active', 'inactive', 'suspended']),
    countBy(Profile, 'verificationStatus', ['pending', 'approved', 'rejected', 'suspended']),
    countBy(Employer, 'verificationStatus', ['pending', 'approved', 'rejected', 'suspended']),
    countBy(Job, 'status', ['pending', 'published', 'closed', 'rejected']),
    Job.countDocuments({ workType: 'remote' }),
    countBy(Application, 'status', APPLICATION_STATUSES),
  ]);

  const applications = APPLICATION_STATUSES.reduce((sum, status) => sum + applicationsByStatus[status], 0);
  const employers = Object.values(employersByStatus).reduce((sum, count) => sum + count, 0);
  const jobs = Object.values(jobsByStatus).reduce((sum, count) => sum + count, 0);

  return {
    users: {
      total: totalUsers,
      jobSeekers: usersByRole.job_seeker,
      employers: usersByRole.employer,
      admins: usersByRole.admin,
      active: usersByStatus.active,
      inactive: usersByStatus.inactive,
      suspended: usersByStatus.suspended,
      pendingJobSeekers: seekersByStatus.pending,
      verifiedJobSeekers: seekersByStatus.approved,
    },
    employers: {
      total: employers,
      pending: employersByStatus.pending,
      approved: employersByStatus.approved,
      rejected: employersByStatus.rejected,
      suspended: employersByStatus.suspended,
    },
    jobs: {
      total: jobs,
      pending: jobsByStatus.pending,
      published: jobsByStatus.published,
      closed: jobsByStatus.closed,
      rejected: jobsByStatus.rejected,
      remote: remoteJobs,
    },
    applications: {
      total: applications,
      applied: applicationsByStatus.applied,
      reviewing: applicationsByStatus.reviewing,
      shortlisted: applicationsByStatus.shortlisted,
      interview: applicationsByStatus.interview,
      hired: applicationsByStatus.hired,
      rejected: applicationsByStatus.rejected,
      placements: applicationsByStatus.hired,
    },
  };
};

module.exports = { getDashboard };
