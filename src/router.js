const express = require('express');
const {
  enrichData,
  parseState,
} = require('./utils');

const {
  middlewareA,
  middlewareB,
  middlewareC,
  middlewareErrorA,
  middlewareErrorB,
} = require('./middlewares');
const {
  controllerOne,
  controllerTwo,
} = require('./controllers');

const splitter = require('./splitter');
const router = express.Router();

router.get('/one/:state',
  parseState,
  enrichData('ep ONE: '),
  splitter(
    req => req.state > 0,
    [middlewareA, middlewareB],
    [middlewareC, middlewareB, middlewareA],
  ),
  controllerOne
);

router.get('/two/:state',
  parseState,
  enrichData('ep TWO: '),
  splitter(
    req => req.state > 0,
    [middlewareC, middlewareC, middlewareA],
    [middlewareA, middlewareErrorA, middlewareB, middlewareC],
  ),
  controllerTwo
);

router.get('/both/:state',
  parseState,
  enrichData('ep BOTH: '),
  splitter(
    ({ state }) => state > 0,
    [middlewareA, middlewareB, controllerOne],
    [middlewareB, middlewareC, controllerTwo],
  )
);

router.get('/complex/:state',
  parseState,
  enrichData('ep COMPLEX: '),
  splitter(
    ({ state }) => state > 0,
    [middlewareC, splitter(
      ({ state }) => state > 10,
      [middlewareA, middlewareA, controllerTwo],
      [middlewareB, middlewareB]
    )],
    [middlewareC, middlewareC, middlewareC],
  ),
  controllerOne
)

module.exports = router;
