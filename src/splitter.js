const invokeMiddlewares = async (middlewares, req, res, next, i = 0) => {
  const invokeNext = async (err) => {
    if (err) return next(err);
    await invokeMiddlewares(middlewares, req, res, next, ++i);
  }
  return i < middlewares.length
    ? await middlewares[i](req, res, invokeNext)
    : next();
};

const splitter = (checker, middlewaresTrue, middlewaresFalse) => {
  return async (req, res, next) => {
    try {
      const middlewares = await checker(req) ? middlewaresTrue : middlewaresFalse;
      await invokeMiddlewares(middlewares, req, res, next);
      return next();
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = splitter;
