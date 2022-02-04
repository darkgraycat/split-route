const express = require('express');
const request = require('supertest');
const matchRoutes = require('../src/matchRoutes');

describe('Test routes matcher middleware', () => {
  const matcher = jest.fn();
  const sleep = (ms) => new Promise((resolve => setTimeout(resolve, ms)));
  const controllerMock = (req, res) => res.status(200).send(`state is ${req.state}`);
  const errorHandlerMock = (err, req, res, next) => res.status(500).send(`error ${err.message}`);
  const middlewareMock = (state, timeout, error = false) => async (req, res, next) => {
    await sleep(timeout || 0);
    if (error) throw error;
    (req.state) ? req.state += state : req.state = state || '';
    next();
  };

  it('should test basic basic splitting', async () => {
    const app = express()
      .use(
        matchRoutes(matcher)
          .case('a', middlewareMock('A'))
          .case('b', middlewareMock('B'))
          .case('withError', middlewareMock('', 200, new Error('error')))
          .end(),
        controllerMock
      ).use(errorHandlerMock);

    matcher.mockResolvedValueOnce('a');
    await request(app).get('/').expect(200, 'state is A');

    matcher.mockResolvedValueOnce('b');
    await request(app).get('/').expect(200, 'state is B');

    matcher.mockResolvedValueOnce('c');
    await request(app).get('/').expect(200, 'state is undefined');

    matcher.mockResolvedValueOnce('withError');
    await request(app).get('/').expect(500, 'error error');

  });

});
