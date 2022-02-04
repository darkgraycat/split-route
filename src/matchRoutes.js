const invokeMiddlewares = async (middlewares, req, res, next, i = 0) => {
  const invokeNext = async (err) => {
    if (err) return next(err);
    await invokeMiddlewares(middlewares, req, res, next, ++i);
  }
  return i < middlewares.length || 0
    ? await middlewares[i](req, res, invokeNext)
    : next();
};

const matchRoutes = (matcher) => {
  const cases = {};
  const builder = {
    case: (value, ...middlewares) => {
      cases[value] = middlewares;
      return builder;
    },
    end: (...defaultMiddlewares) => async (req, res, next) => {
      try {
        const caseKey = await matcher(req);
        const middlewares = cases[caseKey] || defaultMiddlewares;
        await invokeMiddlewares(middlewares, req, res, next);
      } catch (error) {
        return next(error);
      }
    }
  }
  return builder;
};

module.exports = matchRoutes;
