const express = require('express');
const router = require('./router');
const routerv2 = require('./routerv2');

const app = express();
app.use(router);
app.use('/v2', routerv2);
app.use((error, req, res, next) => {
  const { message } = error;
  const { data } = res;
  res.status(500).send(`Error: ${message}<br>Data:${data}`);
});

const port = 8088;

app.listen(port, () => {
  console.log('started at ' + port);
});

module.exports = app;
