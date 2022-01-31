const sleep = (ms) => new Promise((resolve => setTimeout(resolve, ms)));

const parseState = (req, res, next) => {
  const { state } = req.params;
  req.state = state;
  return next();
}

const enrichData = (data) => (req, res, next) => {
  res.data = data;
  return next();
}

module.exports = {
  sleep,
  parseState,
  enrichData,
}
