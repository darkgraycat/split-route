/*
  This approach uses .shift method, so we should make copy of array using spread operator
*/
const invokeMiddlewares = async (middlewares, req, res, next) => {
  const invokeNext = async (err) => {
    if (err) return next(err);
    await invokeMiddlewares(middlewares, req, res, next)
  };
  const middleware = middlewares.shift();
  return middleware
    ? await middleware(req, res, invokeNext)
    : next();
};

const splitter = (checker, middlewaresTrue, middlewaresFalse) => {
  return async (req, res, next) => {
    try {
      const middlewares = await checker(req) ? middlewaresTrue : middlewaresFalse;
      await invokeMiddlewares([...middlewares], req, res, next);
      return next();
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = splitter;
