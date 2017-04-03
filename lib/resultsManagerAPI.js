'use strict';

const MongoClient = require('mongodb').MongoClient;
const restify = require('restify');
const fs = require('fs');

const JOB_RESULT_LIMIT = 100;

function ResultsManagerAPI() {
  const self = this;

  self.version = require('../package.json').version;

  self.database = 'results-manager';
  self.resultsCollection = 'results';
  self.fingerprintsCollection = 'fingerprints';

  self.port = process.env.RESULTS_MANAGER_PORT || 4747;
  self.hostname = process.env.RESULTS_MANAGER_HOST || 'results-manager.dev.onshape.com';
  self.url = process.env.RESULTS_MANAGER_URL || `http://${self.hostname}:${self.port}`;

  self.views = {
    individual: {
      file: './views/individual.html',
      data: ''
    }
  };

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
    if (obj) {
      return JSON.stringify(obj, function(key, value) {
        if (key === 'items' || key === 'children') {
          return '...';
        } else {
          return value;
        }
      });
    } else {
      return null;
    }
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
  // Root endpoint

  server.get('/data', function(req, res, next) {
    const response = {
      fingerprints: `${self.requestUrl(req)}/fingerprint`,
      jobs: `${self.requestUrl(req)}/job`,
      users: `${self.requestUrl(req)}/user`
    };
    self.log(req);
    res.send(200, response);
    next();
  });

  ////////////////////
  // User specific: email or user (culprits)

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

  server.get('/data/user', function(req, res, next) {
    self.results.aggregate([ {
      $unwind: '$culprits'
    }, {
      $group: {
        _id: '$culprits',
        tests: {
          $sum: 1
        }
      }
    } ], function(err, items) {
      items.map(function(item) {
        item.user = item._id;
        item.url = `${self.requestUrl(req)}/${item.user}`;
        delete item._id;
      });
      const results = {
        items: items,
        count: items.length
      };

      self.log(req, results);
      res.send(200, results);
      next();
    });
  });

  server.get('/data/user/:user', function(req, res, next) {
    self.results.aggregate([ {
      $match: {
        culprits: req.params.user
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
        user: req.params.user,
        items: items,
        count: items.length
      };

      self.log(req, results);
      res.send(200, results);
      next();
    });
  });

  ////////////////////
  // Fingerprints

  server.get('/data/fingerprint', function(req, res, next) {
    self.results.aggregate([ {
      $match: {
        fingerprint: {
          $exists: true
        }
      }
    }, {
      $group: {
        _id: '$fingerprint',
        type: {
          $last: '$type'
        },
        name: {
          $last: '$name'
        },
        timestamp: {
          $max: '$timestamp'
        },
        count: {
          $sum: 1
        }
      }
    }, {
      $match: {
        count: {
          $gt: 1
        }
      }
    }, {
      $sort: {
        timestamp: -1,
        count: -1
      }
    } ], function(err, items) {
      items.map(function(item) {
        item.fingerprint = item._id;
        item.url = `${self.requestUrl(req)}/${item.fingerprint}`;
        delete item._id;
      });
      items = items.filter(function(item) {
        if (item.count < 2) {
          return false;
        }
        return true;
      });
      const results = {
        items: items,
        count: items.length,
        parentUrl: `${self.baseDataUrl(req)}`
      };

      self.log(req, results);
      res.send(200, results);
      next();
    });
  });

  server.get('/data/fingerprint/:fingerprint', function(req, res, next) {
    self.fingerprints.findOne({
      fingerprint: req.params.fingerprint
    }, function(claimErr, claim) {
      self.results.find({
        fingerprint: req.params.fingerprint
      }, {
        _id: 0,
        job: 1,
        build: 1,
        name: 1,
        title: 1,
        type: 1,
        state: 1,
        culprits: 1,
        timestamp: 1
      }).sort({
        timestamp: -1
      }).toArray(function(err, items) {
        items.map(function(item) {
          item.url = `${self.baseDataUrl(req)}/job/${item.job}/${item.build}/${item.type}/${item.name}`;
          item.viewUrl = item.url.replace('/data/', '/view/');
        });
        const results = {
          claimed: false,
          claimUrl: `${self.requestUrl(req)}/claim`,
          items: items,
          count: items.length
        };
        if (claim) {
          results.claimed = true;
          results.claim = claim;
        }
        self.log(req, results);
        res.send(200, results);
        next();
      });
    });
  });

  ////////////////////
  // Jobs

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
        parentUrl: `${self.baseDataUrl(req)}/job`
      };

      self.log(req, results);
      res.send(200, results);
      next();
    });
  });

  server.get('/data/job', function(req, res, next) {
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
        item.url = `${self.requestUrl(req)}/${item.job}`;
        item.latestUrl = `${self.requestUrl(req)}/${item.job}/${item.latest}`;
        delete item._id;
      });

      self.log(req, items);
      res.send(200, items);
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
      result = result || {};
      result.parentUrl = `${self.baseDataUrl(req)}/job/${req.params.job}/${req.params.build}/${req.params.type}`;
      if (result.email) {
        result.ownerUrl = `${self.baseDataUrl(req)}/email/${result.email}`;
      }
      result.viewUrl = self.requestUrl(req).replace('/data/', '/view/');
      if (result.fingerprint) {
        result.fingerprintUrl = `${self.baseDataUrl(req)}/fingerprint/${result.fingerprint}`;
      }

      self.log(req, result);
      res.send(200, result);
      next();
    });
  });

  ////////////////////
  // Views

  server.get('/view/job/:job/:build/:type/:name', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end(self.views.individual.data);
    next();
  });

  ////////////////////
  // Database rebuild

  self.rebuild = function(done) {
    MongoClient.connect(`mongodb://localhost:27017/${self.database}`, function(err, db) {
      self.results = db.collection(self.resultsCollection);
      self.fingerprints = db.collection(self.fingerprintsCollection);

      self.results.drop(function() {
        self.results.createIndex({
          job: 1,
          build: 1,
          type: 1,
          name: 1
        }, {
          unique: true
        }, function() {
          self.fingerprints.drop(function() {
            self.fingerprints.createIndex({
              fingerprint: 1
            }, {
              unique: true
            }, function() {
              done();
            });
          });
        });
      });
    });
  };

  ////////////////////
  // Boot and Load Views

  self.loadViews = function() {
    for (const view in self.views) {
      self.views[view].data = fs.readFileSync(self.views[view].file).toString();
    }
  };

  self.boot = function() {
    self.loadViews();

    MongoClient.connect(`mongodb://localhost:27017/${self.database}`, function(err, db) {
      self.db = db;

      self.results = db.collection(self.resultsCollection);
      self.fingerprints = db.collection(self.fingerprintsCollection);

      server.listen(self.port, function() {
        console.info('Results Manager API Server v%s listening at %s', self.version, server.url);
      });
    });
  };
};

module.exports = new ResultsManagerAPI();
