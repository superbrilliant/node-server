var bunyan = require('bunyan');
var express = require('express');
var uuid = require('node-uuid');

var TIMEOUT_MS = 5000;

var app = express();
// Disable etag b/c default ignores response HTTP headers.
app.set('etag', false);

var log = bunyan.createLogger({name: 'test-server'});

var requestLoggerMiddleware = function(req, res, next) {
  var startTime = new Date();
  var reqContext = {
    requestId: uuid.v1(),
    url: req.originalUrl,
    httpMethod: req.method,
  };
  req.log = log.child(reqContext);
  req.log.info('Request started');

  res.on('finish', function() {
    req.log.info({
      'httpStatusCode': res.statusCode,
      'latencyMs': (new Date() - startTime),
    }, 'Request finished');
  });
  next();
};
app.use(requestLoggerMiddleware);

app.get('/', function(req, res) {
  res.set('Content-Type', 'text/plain');
  res.status(200).send('ok');
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  log.info({port: port}, 'Listening');
});
