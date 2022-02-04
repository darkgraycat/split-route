const router = require('express').Router();
const matchRoutes = require('./matchRoutes');

const { enrichData, parseState } = require('./utils');
const { controllerOne, controllerTwo } = require('./controllers');
const {
  middlewareA, middlewareB, middlewareC,
  middlewareErrorA, middlewareErrorB,
} = require('./middlewares');

router.get('/one/:state',
  parseState,
  enrichData('epv2 ONE: '),
  matchRoutes(req => req.state)
    .case('a', middlewareA, middlewareB, middlewareC)
    .case('b', middlewareB, middlewareC)
    .case('c', middlewareC)
    .end(),
  controllerOne
);

router.get('/two/:state',
  parseState,
  enrichData('epv2 TWO: '),
  matchRoutes(req => req.state)
    .case('a', middlewareA, controllerOne)
    .case('b', middlewareB, controllerTwo)
    .default(middlewareErrorB)
    .end()
);

module.exports = router;
