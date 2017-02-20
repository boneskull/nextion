import {UART} from '../src/uart';
import {MockSerialPort} from './harness';

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

    describe('assertPortOpen()', function () {
      describe('when the port does not exist', function () {
        beforeEach(function () {
          uart.port = null;
        });
        it('should throw', function () {
          expect(() => uart.assertPortOpen(), 'to throw', Error);
        });
      });

      describe('when the port exists', function () {
        describe('but is closed', function () {
          beforeEach(function () {
            uart.port.close();
          });
          it('should throw', function () {
            expect(() => uart.assertPortOpen(), 'to throw', Error);
          });
        });
      });

      describe('when the port exists and is open', function () {
        it('should not throw', function () {
          expect(() => uart.assertPortOpen(), 'not to throw');
        });
      });
    });
  });
});
