/* eslint-disable no-new */
import {Nextion} from '../../src/nextion';
import {EventEmitter} from 'events';

describe('Nextion', function () {
  let sbx;
  let uart;

  beforeEach(function () {
    sbx = sinon.sandbox.create();
    uart = new EventEmitter();
    uart.bind = sbx.stub()
      .returns(Promise.resolve(uart));
    uart.unbind = sbx.stub()
      .returns(Promise.resolve(uart));
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
    let nextion;

    beforeEach(function () {
      nextion = new Nextion(uart);
    });

    describe('setValue()', function () {
      beforeEach(function () {
        uart.setValue = sbx.spy(() => Promise.resolve());
      });

      describe('when Nextion not ready', function () {
        it('should wait until readiness', function () {
          const promise = nextion.setValue('foo', 'bar');
          process.nextTick(() => {
            nextion.emit('connected');
          });
          return expect(promise, 'to be fulfilled');
        });
      });

      describe('when Nextion ready', function () {
        beforeEach(function () {
          nextion.emit('connected');
        });

        it('should continue', function () {
          return expect(nextion.setValue('foo', 'bar'), 'to be fulfilled');
        });
      });
    });

    describe.skip('setVariableValue()', function () {
    });

    describe.skip('setComponentValue()', function () {

    });
  });
});
