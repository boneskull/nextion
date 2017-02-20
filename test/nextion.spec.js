/* eslint-disable no-new */
import {Nextion} from '../src/nextion';

describe('Nextion', function () {
  let sbx;
  let uart;

  beforeEach(function () {
    sbx = sinon.sandbox.create();
    uart = {
      bind: sbx.spy(),
      unbind: sbx.spy()
    };
  });

  afterEach(function () {
    sbx.restore();
  });

  describe('constructor', function () {
    describe('when called without a valid "uart" parameter', function () {
      it('should throw', function () {
        expect(() => new Nextion(), 'to throw', TypeError);
      });
    });

    describe('when called with a valid "uart" parameter', function () {
      it('should not throw', function () {
        expect(() => new Nextion(uart), 'not to throw');
      });

      it('should call UART#bind()', function () {
        new Nextion(uart);
        expect(uart.bind, 'was called');
      });
    });
  });

  describe('method', function () {
    describe.skip('setValue()', function () {

    });

    describe.skip('setVariableValue()', function () {
    });

    describe.skip('setComponentValue()', function () {

    });
  });
});
