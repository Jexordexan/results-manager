'use strict';

const MongoClient = require('mongodb').MongoClient;
const restify = require('restify');

const JOB_RESULT_LIMIT = 100;

function ResultsManagerAPI() {
  const self = this;

  self.version = require('../package.json').version;

  self.database = 'results-manager';
  self.resultsCollection = 'results';

  self.port = process.env.RESULTS_MANAGER_PORT || 4747;
  self.hostname = process.env.RESULTS_MANAGER_HOST || 'results-manager.dev.onshape.com';
  self.url = process.env.RESULTS_MANAGER_URL || `http://${self.hostname}:${self.port}`;

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

  ////////////////////

  self.baseDataUrl = function(req) {
    if (req.headers && req.headers.host) {
      return `http://${req.headers.host}/data`;
    } else {
      return `http://${self.url}/data`;
    }
  };

  self.requestUrl = function(req) {
    if (req.headers && req.headers.host) {
      return `http://${req.headers.host}${req.url}`;
    } else {
      return `http://${self.url}${req.url}`;
    }
  };

  self.shallowStringify = function(obj) {
    return JSON.stringify(obj, function(key, value) {
      if (key === 'items' || key === 'children') {
        return '...';
      } else {
        return value;
      }
    });
  };

  self.log = function(req, data) {
    console.log('[%s] %s %s: %s', Date.now(), req.method,
                self.requestUrl(req), self.shallowStringify(data));
  };

  ////////////////////

  self.postData = function(req, res, next) {
    const data = req.body;

    if (req.params.job) {
      data.job = req.params.job;
    }
    data.job = data.job.replace(/\//g, '-');

    if (req.params.build) {
      data.build = req.params.build;
    }
    data.build = data.build.replace(/\//g, '-');

    data.timestamp = Date.now();

    self.log(req, data);

    self.results.insert(data, function(err, inserted) {
      if (err) {
        self.log(req, err);
        res.send(400, {
          message: 'FAILED'
        });
      } else {
        self.log(req, inserted);
        res.send(200, {
          message: 'OK'
        });
      }
      next();
    });
  };

  server.post('/data', self.postData);
  server.post('/data/:job/:build/', self.postData);

  ////////////////////

  server.get('/data', function(req, res, next) {
    self.results.aggregate([ {
      $group: {
        _id: '$job',
        timestamp: {
          $max: '$timestamp'
        },
        latest: {
          $last: '$build'
        }
      }
    }, {
      $sort: {
        timestamp: -1
      }
    }, {
      $limit: JOB_RESULT_LIMIT
    } ], function(err, items) {
      items.map(function(item) {
        item.job = item._id;
        item.url = `${self.requestUrl(req)}/job/${item.job}`;
        item.latestUrl = `${self.requestUrl(req)}/job/${item.job}/${item.latest}`;
        delete item._id;
      });

      self.log(req, items);
      res.send(200, items);
      next();
    });
  });

  server.get('/data/email/:email', function(req, res, next) {
    self.results.aggregate([ {
      $match: {
        email: req.params.email
      }
    }, {
      $group: {
        _id: '$job',
        timestamp: {
          $max: '$timestamp'
        },
        latest: {
          $last: '$build'
        }
      }
    }, {
      $sort: {
        timestamp: -1
      }
    } ], function(err, items) {
      items.map(function(item) {
        item.job = item._id;
        item.url = `${self.baseDataUrl(req)}/job/${item.job}`;
        item.latestUrl = `${self.baseDataUrl(req)}/job/${item.job}/${item.latest}`;
        delete item._id;
      });
      const results = {
        email: req.params.email,
        items: items,
        count: items.length
      };

      self.log(req, results);
      res.send(200, results);
      next();
    });
  });

  server.get('/data/job/:job', function(req, res, next) {
    self.results.aggregate([ {
      $match: {
        job: req.params.job
      }
    }, {
      $group: {
        _id: '$build',
        timestamp: {
          $max: '$timestamp'
        }
      }
    }, {
      $sort: {
        timestamp: -1
      }
    } ], function(err, items) {
      items.map(function(item) {
        item.build = item._id;
        delete item._id;
        item.url = `${self.requestUrl(req)}/${item.build}`;
      });
      const results = {
        job: req.params.job,
        items: items,
        count: items.length,
        parentUrl: `${self.baseDataUrl(req)}/`
      };

      self.log(req, results);
      res.send(200, results);
      next();
    });
  });

  server.get('/data/job/:job/:build', function(req, res, next) {
    self.results.find({
      job: req.params.job,
      build: req.params.build
    }, {
      _id: 0,
      name: 1,
      title: 1,
      type: 1,
      state: 1
    }).sort({
      type: 1,
      name: 1
    }).toArray(function(err, items) {
      const results = {
        job: req.params.job,
        build: req.params.build,
        groups: {}
      };

      items.map(function(item) {
        item.url = `${self.requestUrl(req)}/${item.type}/${item.name}`;

        results.groups[item.type] = results.groups[item.type] || {
          url: `${self.requestUrl(req)}/${item.type}`,
          items: []
        };
        results.groups[item.type].items.push(item);
        results.groups[item.type].count = results.groups[item.type].items.length;
      });

      results.parentUrl = `${self.baseDataUrl(req)}/job/${req.params.job}/`;

      self.log(req, results);
      res.send(200, results);
      next();
    });
  });

  server.get('/data/job/:job/:build/:type', function(req, res, next) {
    self.results.find({
      job: req.params.job,
      build: req.params.build,
      type: req.params.type
    }, {
      _id: 0,
      name: 1,
      title: 1,
      type: 1,
      state: 1
    }).sort({
      type: 1,
      name: 1
    }).toArray(function(err, items) {
      items.map(function(item) {
        item.url = `${self.requestUrl(req)}/${item.name}`;
      });

      const result = {
        job: req.params.job,
        build: req.params.build,
        type: req.params.type,
        items: items,
        count: items.length,
        parentUrl: `${self.baseDataUrl(req)}/job/${req.params.job}/${req.params.build}`
      };

      self.log(req, result);
      res.send(200, result);
      next();
    });
  });

  server.get('/data/job/:job/:build/:type/:name', function(req, res, next) {
    self.results.findOne({
      job: req.params.job,
      build: req.params.build,
      type: req.params.type,
      name: req.params.name
    }, {
      _id: 0
    }, function(err, result) {
      result.parentUrl = `${self.baseDataUrl(req)}/job/${req.params.job}/${req.params.build}/${req.params.type}`;

      self.log(req, result);
      res.send(200, result);
      next();
    });
  });

  ////////////////////

  self.rebuild = function(done) {
    MongoClient.connect(`mongodb://localhost:27017/${self.database}`, function(err, db) {
      self.results = db.collection(self.resultsCollection);

      self.results.drop(function() {

        self.results.createIndex({
          job: 1,
          build: 1,
          type: 1,
          name: 1
        }, {
          unique: true
        }, function() {
          done();
        });
      });
    });
  };

  ////////////////////

  self.boot = function() {
    MongoClient.connect(`mongodb://localhost:27017/${self.database}`, function(err, db) {
      self.db = db;
      self.results = db.collection(self.resultsCollection);

      server.listen(self.port, function() {
        console.info('Results Manager API Server v%s listening at %s', self.version, server.url);
      });
    });
  };
};

module.exports = new ResultsManagerAPI();
