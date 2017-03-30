import {fromPort} from '../../src';

describe('fade effects', function () {
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
        return nextion.system.wake();
      })
      .then(() => {
        return nextion.uart.send('code_c');
      })
      .catch(() => {
        this.skip();
      });
  });

  it.skip('should fade the screen out', function () {
    return nextion.system.brightness()
      .then(() => expect(nextion.system.fadeOut(), 'to be fulfilled'));
  });

  it('should fade the screen in', function () {
    return expect(nextion.system.fadeIn(), 'to be fulfilled');
  });

  afterEach(function () {
    if (nextion) {
      return nextion.close();
    }
  });
});
