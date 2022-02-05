const express = require('express');
const request = require('supertest');
const matchRoutes = require('../lib');

describe('Test routes matcher middleware', () => {
  const matcher = jest.fn();
  const sleep = (ms) => new Promise((resolve => setTimeout(resolve, ms)));
  const controllerMock = (req, res) => res.status(200).send(`state is ${req.state}`);
  const errorHandlerMock = (err, req, res, next) => res.status(500).send(`error ${err.message}`);
  const middlewareMock = (state, timeout, error) => async (req, res, next) => {
    await sleep(timeout || 0);
    if (error) {
      return next(error);
    }
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

  it('should test async functionality', async () => {
    const app = express()
      .use(
        matchRoutes(matcher)
          .case('a', middlewareMock('A', 500))
          .case('b', middlewareMock('B', 1000))
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

  it('should test middlewares chaining', async () => {
    const app = express()
      .use(
        matchRoutes(matcher)
          .case('numbers',
            middlewareMock('1'),
            middlewareMock('2'),
            middlewareMock('3'),
            middlewareMock('4'),
          )
          .case('characters',
            middlewareMock('A'),
            middlewareMock('B'),
            middlewareMock('C'),
            middlewareMock('D'),
          )
          .end(),
        controllerMock
      ).use(errorHandlerMock);

    matcher.mockResolvedValueOnce('numbers');
    await request(app).get('/').expect(200, 'state is 1234');

    matcher.mockResolvedValueOnce('characters');
    await request(app).get('/').expect(200, 'state is ABCD');
  });

  it('should test default middlewares set', async () => {
    const app = express()
      .use(
        matchRoutes(matcher)
          .case('common', middlewareMock('A', 50), middlewareMock('B', 50))
          .case('withError', middlewareMock('', 200, new Error('error')))
          .default(middlewareMock('DEF'), middlewareMock('AULT'))
          .end(),
        controllerMock
      ).use(errorHandlerMock);

    matcher.mockResolvedValueOnce('common');
    await request(app).get('/').expect(200, 'state is AB');

    matcher.mockResolvedValueOnce(undefined);
    await request(app).get('/').expect(200, 'state is DEFAULT');

    matcher.mockResolvedValueOnce('withError');
    await request(app).get('/').expect(500, 'error error');
  });

  it('should test splitter inside splitter', async () => {
    const app = express()
      .use(
        matchRoutes(matcher)
          .case('splitted', matchRoutes(matcher)
            .case('splitted A', middlewareMock('SPL', 10), middlewareMock('ITT', 20), middlewareMock('ED A', 30))
            .case('splitted B', middlewareMock('SPLIT', 40), middlewareMock('TED B', 50))
            .default(middlewareMock('SPLITTED'), middlewareMock(' DEFAULT', 100))
            .end()
          )
          .case('single', middlewareMock('sin'), middlewareMock('gle'))
          .default(middlewareMock('', 200, new Error('error')))
          .end(),
        controllerMock
      ).use(errorHandlerMock);

    matcher.mockResolvedValueOnce('single');
    await request(app).get('/').expect(200, 'state is single');

    matcher.mockResolvedValueOnce(undefined);
    await request(app).get('/').expect(500, 'error error');

    matcher.mockResolvedValueOnce('splitted');
    matcher.mockResolvedValueOnce('splitted A');
    await request(app).get('/').expect(200, 'state is SPLITTED A');

    matcher.mockResolvedValueOnce('splitted');
    matcher.mockResolvedValueOnce('splitted B');
    await request(app).get('/').expect(200, 'state is SPLITTED B');

    matcher.mockResolvedValueOnce('splitted');
    matcher.mockResolvedValueOnce(undefined);
    await request(app).get('/').expect(200, 'state is SPLITTED DEFAULT');
  });

  it('should test error handling functionality', async () => {
    const app = express()
      .use(
        matchRoutes(matcher)
          .case('a',
            (req, res, next) => { throw new Error('A unhandled error'); },
            (req, res, next) => { return next(new Error('A error from next')); }
          )
          .case('b',
            (req, res, next) => { return next(new Error('B error from next')); },
            (req, res, next) => { throw new Error('B unhandled error'); }
          ).end(),
        controllerMock
      ).use(errorHandlerMock);

    matcher.mockResolvedValueOnce('a');
    await request(app).get('/').expect(500, 'error A unhandled error');

    matcher.mockResolvedValueOnce('b');
    await request(app).get('/').expect(500, 'error B error from next');

    matcher.mockRejectedValueOnce(new Error('matcher error'));
    await request(app).get('/').expect(500, 'error matcher error');

    matcher.mockResolvedValueOnce();
    await request(app).get('/').expect(200, 'state is undefined');
  });

  it('should test various types of case values', async () => {
    const app = express()
      .use(
        matchRoutes(matcher)
          .case('string', middlewareMock('String'))
          .case(42, middlewareMock('Number'))
          .case(false, middlewareMock('Boolean'))
          .case(['foo', 'bar', null, 42], middlewareMock('Array'))
          .end(),
        controllerMock
      ).use(errorHandlerMock);

    matcher.mockResolvedValueOnce('string');
    await request(app).get('/').expect(200, 'state is String');

    matcher.mockResolvedValueOnce(42);
    await request(app).get('/').expect(200, 'state is Number');

    matcher.mockResolvedValueOnce(false);
    await request(app).get('/').expect(200, 'state is Boolean');

    matcher.mockResolvedValueOnce(['foo', 'bar', null, 42]);
    await request(app).get('/').expect(200, 'state is Array');
  });

  it('should test complex structure', async () => {
    const app = express()
      .use(
        middlewareMock(42, 100),
        matchRoutes(matcher)
          .case('add',
            middlewareMock(10),
            matchRoutes(matcher)
              .case('add', middlewareMock(5, 100))
              .case('substract', middlewareMock(-5, 100))
              .end()
          )
          .case('substract',
            middlewareMock(-10),
            matchRoutes(matcher)
              .case('add', middlewareMock(5, 100))
              .case('substract', middlewareMock(-5, 100))
              .end()
          )
          .end(),
        controllerMock
      ).use(errorHandlerMock);

    matcher.mockResolvedValueOnce('add');
    matcher.mockResolvedValueOnce('add');
    await request(app).get('/').expect(200, `state is ${42 + 10 + 5}`);

    matcher.mockResolvedValueOnce('substract');
    matcher.mockResolvedValueOnce('substract');
    await request(app).get('/').expect(200, `state is ${42 - 10 - 5}`);

    matcher.mockResolvedValueOnce('add');
    matcher.mockResolvedValueOnce('substract');
    await request(app).get('/').expect(200, `state is ${42 + 10 - 5}`);

    matcher.mockResolvedValueOnce('substract');
    matcher.mockResolvedValueOnce('add');
    await request(app).get('/').expect(200, `state is ${42 - 10 + 5}`);
  });
});
