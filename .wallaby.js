'use strict';

module.exports = function wallabyConfig (wallaby) {
  return {
    files: [
      'src/**/*.js',
      'test/harness.js'
    ],
    tests: [
      'test/**/*.spec.js'
    ],
    env: {
      type: 'node',
      runner: 'node'
    },
    testFramework: 'mocha',
    compilers: {
      '**/*.js': wallaby.compilers.babel()
    },
    bootstrap: function bootstrap (wallaby) {
      const path = require('path');
      require(path.join(wallaby.projectCacheDir, 'test', 'harness'));
    }
  };
};
