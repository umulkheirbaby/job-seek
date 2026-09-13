const request = require('supertest');
const app = require('../src/app');

describe('health', () => {
  it('reports API and MongoDB status without a stack trace', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
    expect(response.body.data.database.status).toBe('connected');
    expect(response.body.data.environment).toBe('test');
    expect(response.body.stack).toBeUndefined();
  });
});
