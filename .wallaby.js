'use strict';
process.env.DEBUG='nextion*';

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
      runner: 'node',
      params: {
        env: 'NEXTION_TEST_PORT=/dev/tty.SLAB_USBtoUART;DEBUG=nextion*'
      }
    },
    workers: {
      initial: 1,
      regular: 1,
      recycle: true
    },
    testFramework: 'mocha',
    compilers: {
      '**/*.js': wallaby.compilers.babel()
    },
    bootstrap: function bootstrap (wallaby) {
      const path = require('path');
      require(path.join(wallaby.projectCacheDir, 'test', 'harness'));
    },
    debug: true
  };
};
