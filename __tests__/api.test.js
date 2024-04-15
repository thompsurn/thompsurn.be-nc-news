const request = require('supertest');
const app = require('../app');
const endpointsData = require('../endpoints.json');

describe('GET /api', () => {
  it('should respond with the correct endpoints data', async () => {
    const response = await request(app).get('/api');
    expect(response.status).toBe(200);
    expect(response.body.endpoints).toEqual(endpointsData);
  });
});

//not really sure of other tests for this one?