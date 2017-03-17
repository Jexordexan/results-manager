'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    eslint: {
      options: {
        cache: true,
        quiet: true
      },
      src: [
        '**/*.js'
      ],
      fix: {
        options: {
          fix: true
        },
        src: [
          '**/*.js'
        ]
      }
    },
    forever: {
      server: {
        options: {
          index: './index.js',
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

  grunt.registerTask('start', [ 'forever:server:start' ]);
  grunt.registerTask('stop', [ 'forever:server:stop' ]);
  grunt.registerTask('restart', [ 'forever:server:restart' ]);

  grunt.registerTask('precommit', [ 'eslint:src' ]);
  grunt.registerTask('default', [ 'precommit' ]);
};
