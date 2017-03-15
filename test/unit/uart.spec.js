import {UART} from '../../src/uart';
import {MockSerialPort} from '../harness';
import {delimiter} from '../../src/protocol';

const SUCCESS = Buffer.from([0x01].concat(delimiter));

expect.addType({
  name: 'UART',
  base: 'object',
  identify (value) {
    return value instanceof UART;
  }
});

describe('UART', function () {
  let sbx;

  beforeEach(function () {
    sbx = sinon.sandbox.create();
  });

  afterEach(function () {
    sbx.restore();
  });

  describe('constructor', function () {
    describe('when supplied a valid "port" object', function () {
      let port;

      beforeEach(function () {
        port = new MockSerialPort();
      });

      it('should not throw', function () {
        expect(() => new UART(port), 'not to throw');
      });

      it('should return a UART instance', function () {
        expect(new UART(port), 'to be a', 'UART');
      });

      it('should set default option "returnCommandResult: always"',
        function () {
          expect(new UART(port), 'to satisfy',
            {opts: {returnCommandResult: 'always'}});
        });
    });

    describe('when supplied an invalid "port" object', function () {
      let port;

      beforeEach(function () {
        port = {};
      });

      it('should throw', function () {
        expect(() => new UART(port), 'to throw', TypeError);
      });
    });
  });

  describe('method', function () {
    let uart;
    let port;

    beforeEach(function () {
      port = new MockSerialPort();
      uart = new UART(port);
    });

    describe('bind()', function () {
      beforeEach(function () {
        sbx.spy(port, 'on');
        sbx.stub(port, 'write', function (data, callback) {
          process.nextTick(() => {
            callback();
            process.nextTick(() => {
              this.emit('data', SUCCESS);
            });
          });
        });
      });

      it(`should listen for port's "data" event`, function () {
        return uart.bind()
          .then(() => {
            expect(port.on, 'was called with', 'data');
          });
      });

      it(`should listen for port's "error" event`, function () {
        return uart.bind()
          .then(() => {
            expect(port.on, 'was called with', 'error');
          });
      });

      describe('when port emits "error"', function () {
        beforeEach(function () {
          return uart.bind();
        });

        it('should cause UART to emit "error"', function () {
          const err = new Error();
          expect(() => port.emit('error', err), 'to emit from', uart, 'error',
            err);
        });
      });
    });
  });
});
