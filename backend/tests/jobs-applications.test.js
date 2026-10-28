const { api, registerUser, createAdmin, login, makePdf } = require('./helpers');
const { PDFDocument } = require('pdf-lib');

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
  it('hides pending jobs, then lets a seeker apply after EmpoweWithIT approval', async () => {
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

    const unverified = await seeker
      .post(`/api/v1/jobs/${jobId}/apply`)
      .send({ coverLetter: 'I can support youth job matching.' });
    expect(unverified.status).toBe(403);

    const profile = await seeker.get('/api/v1/profile');
    await admin
      .patch(`/api/v1/admin/job-seekers/${profile.body.data.profile._id}/verify`)
      .send({ verificationStatus: 'approved' });

    const missingPdf = await seeker
      .post(`/api/v1/jobs/${jobId}/apply`)
      .send({ coverLetter: 'I can support youth job matching.' });
    expect(missingPdf.status).toBe(400);
    expect(missingPdf.body.errors.documents).toMatch(/profile/i);

    const cv = await makePdf('Curriculum vitae');
    const certificates = await makePdf('Certificates');
    const uploaded = await seeker
      .post('/api/v1/profile/document')
      .attach('documents', cv, { filename: 'cv.pdf', contentType: 'application/pdf' })
      .attach('documents', certificates, {
        filename: 'certificates.pdf',
        contentType: 'application/pdf',
      });
    expect(uploaded.status).toBe(200);
    expect(uploaded.body.data.profile.hasDocument).toBe(true);
    expect(uploaded.body.data.stats.hasDocument).toBe(true);

    const adminPdf = await admin.get(
      `/api/v1/admin/job-seekers/${profile.body.data.profile._id}/document`
    );
    expect(adminPdf.status).toBe(200);

    const profilePdf = await seeker.get('/api/v1/profile/document');
    expect(profilePdf.status).toBe(200);
    const stored = await PDFDocument.load(profilePdf.body);
    expect(stored.getPageCount()).toBe(2);

    const applied = await seeker
      .post(`/api/v1/jobs/${jobId}/apply`)
      .send({ coverLetter: 'I can support youth job matching.' });
    expect(applied.status).toBe(201);
    expect(applied.body.data.application.status).toBe('applied');
    expect(applied.body.data.application.hasDocument).toBe(true);
    expect(applied.body.data.application.documentOriginalName).toBe('combined-documents.pdf');

    const document = await seeker.get(
      `/api/v1/applications/${applied.body.data.application._id}/document`
    );
    expect(document.status).toBe(200);
    expect(document.headers['content-type']).toMatch(/pdf/);
    const combined = await PDFDocument.load(document.body);
    expect(combined.getPageCount()).toBe(2);

    const employerCopy = await employer.get(
      `/api/v1/applications/${applied.body.data.application._id}/document`
    );
    expect(employerCopy.status).toBe(200);

    const outsider = api();
    await registerUser(outsider, { email: `seeker.other.${Date.now()}@example.com` });
    const blocked = await outsider.get(
      `/api/v1/applications/${applied.body.data.application._id}/document`
    );
    expect(blocked.status).toBe(403);

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
