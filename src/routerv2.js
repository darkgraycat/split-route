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
  matchRoutes(req => req.state > 0)
    .case(true, middlewareA, middlewareB)
    .case(false, middlewareC, middlewareB, middlewareA)
    .end(),
  controllerOne
);

module.exports = router;
