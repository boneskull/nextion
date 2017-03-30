import {fromPort} from '../../src';

describe('command response', function () {
  let nextion;

  before(function () {
    if (!process.env.NEXTION_TEST_PORT) {
      this.skip();
    }
  });

  beforeEach(function () {
    return fromPort(process.env.NEXTION_TEST_PORT)
      .then(_nextion => {
        nextion = _nextion;
      })
      .catch(() => {
        this.skip();
      });
  });

  it('should respond when setting a variable', function () {
    return expect(nextion.system.setSystemVariable('sys0', 0),
      'to be fulfilled with', {
        name: 'success',
        code: 1
      });
  });

  afterEach(function () {
    if (nextion) {
      return nextion.close();
    }
  });
});
