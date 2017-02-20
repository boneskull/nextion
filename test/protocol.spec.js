import {NextionProtocol} from '../src/protocol';
import {codes, codesByName} from '../src/codes';

describe('NextionProtocol', function () {
  let sbx;

  beforeEach(function () {
    sbx = sinon.sandbox.create();
  });

  afterEach(function () {
    sbx.restore();
  });

  describe('constructor', function () {
    it('should not throw', function () {
      expect(() => new NextionProtocol(), 'not to throw');
    });
  });

  it('should trim a trailing [0xff, 0xff, 0xff] from the read buffer',
    function () {
      expect(new NextionProtocol().read(Buffer.from([
        102,
        111,
        111,
        98,
        97,
        114,
        0xff,
        0xff,
        0xff
      ])).buffer, 'to equal', Buffer.from([
        102,
        111,
        111,
        98,
        97,
        114
      ]));
    });

  describe('helper', function () {
    let nextion;

    beforeEach(function () {
      nextion = new NextionProtocol();
    });

    describe('commandName', function () {
      describe('when given an unknown command', function () {
        let buf;

        beforeEach(function () {
          buf = Buffer.from([0xdeadbeef]);
        });

        it('should throw', function () {
          expect(() => {
            nextion.read(buf)
              .code();
          }, 'to throw');
        });
      });

      describe('when given a known code', function () {
        let buf;

        beforeEach(function () {
          buf = Buffer.from([codesByName.pageId]);
        });

        it('should not throw', function () {
          expect(() => {
            nextion.read(buf)
              .code();
          }, 'not to throw');
        });

        it('should return the code name',
          function () {
            expect(nextion.read(buf)
              .code().result, 'to be', codes[codesByName.pageId]);
          });
      });
    });
  });

  describe('code', function () {
    let nextion;

    beforeEach(function () {
      nextion = new NextionProtocol();
    });

    describe('touchEvent', function () {
      let buf;
      beforeEach(function () {
        sbx.spy(nextion.reader, 'byte');
        buf = Buffer.from([
          0x00,
          0x02,
          0x01
        ]);
      });

      it('should parse three (3) UInt8 values', function () {
        nextion.read(buf)
          .touchEvent();
        expect(nextion.reader.byte, 'was called thrice');
      });

      it(
        'should return a result object containing number "page_id", number "button_id" and boolean "release_event"',
        function () {
          expect(nextion.read(buf).touchEvent().result, 'to equal', {
            pageId: 0,
            buttonId: 2,
            releaseEvent: true
          });
        });
    });

    describe('pageId', function () {
      let buf;
      beforeEach(function () {
        sbx.spy(nextion.reader, 'byte');
        buf = Buffer.from([
          0x03
        ]);
      });

      it('should parse one (1) UInt8 values', function () {
        nextion.read(buf)
          .pageId();
        expect(nextion.reader.byte, 'was called once');
      });

      it('should return a result object containing number "pageId"',
        function () {
          expect(nextion.read(buf)
            .pageId().result, 'to equal', {pageId: 3});
        });
    });

    describe('stringData', function () {
      let buf;

      beforeEach(function () {
        buf = Buffer.from('foobar', 'ascii');
      });

      it('should return a result object containing value of the string',
        function () {
          expect(nextion.read(buf)
            .stringData().result, 'to have property', 'value', 'foobar');
        });
    });

    describe('numericData', function () {
      let buf;

      beforeEach(function () {
        buf = Buffer.alloc(16);
        buf.writeInt16LE(-132, 0);
      });

      it('should read an signed 16-bit integer', function () {
        expect(nextion.read(buf)
          .numericData().result, 'to have property', 'value', -132);
      });
    });

    describe('touchCoordinate', function () {
      let buf;

      beforeEach(function () {
        buf = Buffer.from([
          1,
          2,
          3,
          4,
          5,
          6,
          0
        ]);
      });

      it('should interpret four coordinates and a touch event', function () {
        expect(nextion.read(buf).touchCoordinate().result, 'to equal', {
          xHigh: 1,
          xLow: 2,
          yHigh: 3,
          yLow: 4,
          pageId: 5,
          buttonId: 6,
          releaseEvent: false
        });
      });
    });

    describe('wake', function () {
      let buf;

      beforeEach(function () {
        buf = Buffer.from([
          1,
          2,
          3,
          4,
          5,
          6,
          0
        ]);
        sbx.stub(nextion.reader, 'touchCoordinate');
      });

      it('should delegate to touchCoordinate', function () {
        nextion.read(buf)
          .wake();
        expect(nextion.reader.touchCoordinate, 'was called once');
      });
    });
  });
});
