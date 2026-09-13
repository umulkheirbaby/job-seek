const { api, registerUser, createAdmin, login } = require('./helpers');

describe('auth and security', () => {
  it('registers a job seeker and keeps the session in an httpOnly cookie', async () => {
    const agent = api();
    const email = `seeker.auth.${Date.now()}@example.com`;
    const response = await registerUser(agent, { email });

    expect(response.status).toBe(201);
    expect(response.body.data.user.email).toBe(email);
    expect(response.body.data.user.password).toBeUndefined();
    expect(response.headers['set-cookie'][0]).toMatch(/HttpOnly/i);

    const me = await agent.get('/api/v1/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe(email);
  });

  it('rejects a public admin registration', async () => {
    const response = await registerUser(api(), {
      email: `admin.public.${Date.now()}@example.com`,
      role: 'admin',
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('blocks guests and job seekers from the admin dashboard', async () => {
    const guest = await api().get('/api/v1/admin/dashboard');
    expect(guest.status).toBe(401);

    const seeker = api();
    await registerUser(seeker, { email: `seeker.forbid.${Date.now()}@example.com` });
    const forbidden = await seeker.get('/api/v1/admin/dashboard');
    expect(forbidden.status).toBe(403);
    expect(forbidden.body.stack).toBeUndefined();
  });

  it('lets an admin suspend a user so they cannot sign in', async () => {
    const seeker = api();
    const email = `seeker.suspend.${Date.now()}@example.com`;
    const registered = await registerUser(seeker, { email });
    const userId = registered.body.data.user._id;

    const admin = api();
    const credentials = await createAdmin();
    await login(admin, credentials.email, credentials.password);

    const suspended = await admin.patch(`/api/v1/admin/users/${userId}/status`).send({ status: 'suspended' });
    expect(suspended.status).toBe(200);

    const blocked = await login(api(), email, 'Password123');
    expect(blocked.status).toBe(403);
  });
});
