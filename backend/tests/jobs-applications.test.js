const { api, registerUser, createAdmin, login } = require('./helpers');

const jobInput = (overrides = {}) => ({
  title: 'Junior React Developer',
  description: 'Remote frontend role for the linkage pipeline.',
  skills: ['React', 'JavaScript'],
  employmentType: 'full_time',
  workType: 'remote',
  experienceLevel: 'junior',
  location: { country: 'Kenya', city: 'Garissa' },
  salary: { min: 400, max: 700, currency: 'USD' },
  deadline: '2026-12-31',
  ...overrides,
});

describe('jobs and applications', () => {
  it('hides pending jobs, then lets a seeker apply after ILO approval', async () => {
    const employer = api();
    const seeker = api();
    const admin = api();

    await registerUser(employer, {
      name: 'Northwind HR',
      email: `employer.jobs.${Date.now()}@example.com`,
      role: 'employer',
    });
    const company = await employer.patch('/api/v1/employers/me').send({
      companyName: 'Northwind Digital',
      description: 'Remote software company.',
      website: 'https://northwind.example',
      industry: 'Technology',
      country: 'Kenya',
      city: 'Garissa',
    });

    const credentials = await createAdmin();
    await login(admin, credentials.email, credentials.password);
    await admin
      .patch(`/api/v1/admin/employers/${company.body.data.employer._id}/verify`)
      .send({ verificationStatus: 'approved' });

    const created = await employer.post('/api/v1/jobs').send(jobInput());
    expect(created.status).toBe(201);
    const jobId = created.body.data.job._id;
    expect(created.body.data.job.status).toBe('pending');

    const hidden = await api().get('/api/v1/jobs');
    expect(hidden.body.data.jobs.some((job) => job._id === jobId)).toBe(false);

    const unpublishedApply = await seeker
      .post(`/api/v1/jobs/${jobId}/apply`)
      .send({ coverLetter: 'Please consider me.' });
    expect([401, 404]).toContain(unpublishedApply.status);

    await registerUser(seeker, { email: `seeker.jobs.${Date.now()}@example.com` });
    const stillHidden = await seeker.post(`/api/v1/jobs/${jobId}/apply`).send({ coverLetter: 'Please consider me.' });
    expect(stillHidden.status).toBe(404);

    await admin.patch(`/api/v1/admin/jobs/${jobId}/approve`).send({ status: 'published' });

    const applied = await seeker
      .post(`/api/v1/jobs/${jobId}/apply`)
      .send({ coverLetter: 'I can support youth job matching.' });
    expect(applied.status).toBe(201);
    expect(applied.body.data.application.status).toBe('applied');

    const duplicate = await seeker
      .post(`/api/v1/jobs/${jobId}/apply`)
      .send({ coverLetter: 'Applying again.' });
    expect(duplicate.status).toBe(409);

    const listed = await employer.get(`/api/v1/jobs/${jobId}/applications`);
    expect(listed.body.data.applications).toHaveLength(1);

    const shortlisted = await employer
      .patch(`/api/v1/applications/${applied.body.data.application._id}/status`)
      .send({ status: 'shortlisted' });
    expect(shortlisted.status).toBe(200);

    const tracked = await seeker.get('/api/v1/applications');
    expect(tracked.body.data.applications[0].status).toBe('shortlisted');
  });
});
