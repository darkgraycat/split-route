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
  const builder = {
    case: (value, ...middlewares) => {
      console.log(value);
      console.log(middlewares);
      return builder;
    },
    end: () => (req, res, next) => { }
  }
  return builder;
};

module.exports = matchRoutes;
