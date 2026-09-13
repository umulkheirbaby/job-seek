const { api, registerUser, createAdmin, login } = require('./helpers');

describe('admin programme monitoring', () => {
  it('returns programme statistics for an administrator', async () => {
    const admin = api();
    const credentials = await createAdmin();
    await login(admin, credentials.email, credentials.password);

    await registerUser(api(), {
      email: `seeker.stats.${Date.now()}@example.com`,
    });
    await registerUser(api(), {
      name: 'Acme HR',
      email: `employer.stats.${Date.now()}@example.com`,
      role: 'employer',
    });

    const response = await admin.get('/api/v1/admin/dashboard');
    expect(response.status).toBe(200);
    expect(response.body.data.stats.users.jobSeekers).toBeGreaterThanOrEqual(1);
    expect(response.body.data.stats.employers.total).toBeGreaterThanOrEqual(1);
    expect(response.body.data.stats.applications.placements).toBe(0);
  });
});
