const invokeMiddlewares = async (middlewares, req, res, next, i = 0) => {
  const invokeNext = async (err) => {
    if (err) return next(err);
    await invokeMiddlewares(middlewares, req, res, next, ++i);
  };
  return i < middlewares.length
    ? await middlewares[i](req, res, invokeNext)
    : next();
};

/**
 * Start building middleware that can have different behavior
 * @param {Function} matcher Callback needed to match routes. Must return {number|string|boolean|null}
 * @returns builder
 */
const matchRoutes = (matcher) => {
  const cases = { default: [] };
  const builder = {
    /**
     * Add case to split route
     * @param {number|string|boolean|null} value Expected matcher function result 
     * @param  {...import('express').RequestHandler} middlewares List of middlewares to be called
     * @returns builder
     */
    case: (value, ...middlewares) => {
      cases[value] = middlewares;
      return builder;
    },
    /**
     * Add case which will be caled by default
     * @param  {...import('express').RequestHandler} middlewares List of middlewares to be called
     * @returns builder
     */
    default: (...middlewares) => builder.case('default', ...middlewares),
    /**
     * End building splitter middleware
     * @returns {import('express').RequestHandler}
     */
    end: () => async (req, res, next) => {
      try {
        const caseKey = await matcher(req);
        const middlewares = cases[caseKey] || cases.default;
        await invokeMiddlewares(middlewares, req, res, next);
      } catch (error) {
        return next(error);
      }
    }
  };
  return builder;
};

module.exports = matchRoutes;
