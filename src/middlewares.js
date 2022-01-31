const { sleep } = require('./utils');

const sleepMult = 1;

const middlewareA = async (req, res, next) => {
  await sleep(100 * sleepMult);
  res.data += 'A';
  return next();
};

const middlewareB = async (req, res, next) => {
  await sleep(200 * sleepMult);
  res.data += 'B';
  return next();
};

const middlewareC = async (req, res, next) => {
  await sleep(300 * sleepMult);
  res.data += 'C';
  return next();
};

const middlewareErrorA = async (req, res, next) => {
  try {
    throw new Error('Error A');
  } catch (error) {
    return next(error);
  }
};

const middlewareErrorB = async (req, res, next) => {
  await sleep(1000 * sleepMult);
  throw new Error('Error B');
};

module.exports = {
  middlewareA,
  middlewareB,
  middlewareC,
  middlewareErrorA,
  middlewareErrorB,
};
