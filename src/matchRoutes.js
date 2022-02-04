const invokeMiddlewares = async (middlewares, req, res, next, i = 0) => {
  const invokeNext = async (err) => {
    if (err) return next(err);
    await invokeMiddlewares(middlewares, req, res, next, ++i);
  }
  return i < middlewares.length
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
    end: () => async (req, res, next) => {
      try {
        const result = await matcher(req);
        await invokeMiddlewares(cases[result], req, res, next);
      } catch (error) {
        return next(error);
      }
    }
  }
  return builder;
};

module.exports = matchRoutes;
