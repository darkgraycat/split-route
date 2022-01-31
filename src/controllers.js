const controllerOne = (req, res, next) => {
  const { data } = res;
  console.log('controller one:', data);
  return res.send(`CONTROLLER ONE [${data}]`);
}

const controllerTwo = (req, res, next) => {
  const { data } = res;
  console.log('controller two:', data);
  return res.send(`CONTROLLER TWO [${data}]`);
}

module.exports = {
  controllerOne,
  controllerTwo,
}
