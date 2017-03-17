'use strict';

const MongoClient = require('mongodb').MongoClient;
const restify = require('restify');

function ResultsManagerAPI() {
  const self = this;

  self.version = '0.0.1';

  const server = restify.createServer({
    name: 'ResultsManagerAPI'
  });
  server.pre(restify.pre.sanitizePath());
  server.use(restify.bodyParser({
    mapParams: false
  }));
  server.use(restify.queryParser());
  server.use(restify.dateParser(5));

  ////////////////////
  // CORS Support
  restify.CORS.ALLOW_HEADERS.push('x-json');
  restify.CORS.EXPOSE_HEADERS.push('x-json');
  server.use(restify.CORS());

  server.opts(/.*/, function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', req.header('Access-Control-Request-Method'));
    res.header('Access-Control-Allow-Headers', req.header('Access-Control-Request-Headers'));
    res.send(200);
    return next();
  });

  server.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
  ////////////////////

  server.on('uncaughtException', function (request, response, route, error) {
    console.log('Results Manager API ERROR: ' + request.method + ' ' + route.spec.path);
    console.log(error.stack);
  });

  server.post('/:job/:id/', function(req, res, next) {
    const data = req.body;
    data.job = req.params.job;
    data.id = req.params.id;
    data.timestamp = Date.now();

    console.log('POST', JSON.stringify(data, null, 2));

    self.results.insert(data, function(err) {
      if (err) {
        res.send(400, {
          message: 'FAILED'
        });
      } else {
        res.send(200, {
          message: 'OK'
        });
      }
      next();
    });
  });

  server.get('/:job/:id', function(req, res, next) {
    self.results.find({
      job: req.params.job,
      id: req.params.id
    }).toArray(function(err, results) {
      console.log('GET', JSON.stringify(results, null, 2));
      res.send(200, results);
      next();
    });
  });

  server.get('/:job/:id/:type', function(req, res, next) {
    self.results.find({
      job: req.params.job,
      id: req.params.id,
      type: req.params.type
    }).toArray(function(err, results) {
      console.log('GET', JSON.stringify(results, null, 2));
      res.send(200, results);
      next();
    });
  });

  server.get('/:job/:id/:type/:name', function(req, res, next) {
    self.results.findOne({
      job: req.params.job,
      id: req.params.id,
      type: req.params.type,
      name: req.params.name
    }, function(err, result) {
      console.log('GET', JSON.stringify(result, null, 2));
      res.send(200, result);
      next();
    });
  });

  self.boot = function() {
    MongoClient.connect('mongodb://localhost:27017/results-manager', function(err, db) {
      self.db = db;
      self.results = db.collection('results');

      server.listen(4747, function() {
        console.info('Results Manager API Server v%s listening at %s', self.version, server.url);
      });
    });
  };
};

const resultsManagerApi = new ResultsManagerAPI();
resultsManagerApi.boot();
