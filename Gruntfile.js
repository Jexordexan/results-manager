'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    eslint: {
      options: {
        cache: true,
        quiet: true
      },
      src: [
        'lib/**/*.js',
        'client/**/*.js',
        'client/**/*.vue'
      ],
      fix: {
        options: {
          fix: true
        },
        src: [
          'lib/**/*.js',
          'client/**/*.js',
          'client/**/*.vue'
        ]
      }
    },
    forever: {
      server: {
        options: {
          index: './server.js',
          logDir: 'logs',
          logFile: 'access_log',
          errFile: 'error_log',
          outFile: 'output'
        }
      }
    }
  });

  grunt.loadNpmTasks('gruntify-eslint');
  grunt.loadNpmTasks('grunt-forever');

  grunt.registerTask('rebuild', 'Drop and rebuild database with index', function() {
    const done = this.async();
    const resultsManagerAPI = require('./lib/resultsManagerAPI');
    resultsManagerAPI.rebuild(function() {
      done();
    });
  });

  grunt.registerTask('start', [ 'forever:server:start' ]);
  grunt.registerTask('stop', [ 'forever:server:stop' ]);
  grunt.registerTask('restart', [ 'forever:server:restart' ]);

  grunt.registerTask('precommit', [ 'eslint:src' ]);
  grunt.registerTask('default', [ 'precommit' ]);
};
