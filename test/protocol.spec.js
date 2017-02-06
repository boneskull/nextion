/* eslint-env mocha */
/* globals expect, sinon */

'use strict';

const {NextionProtocol} = require('../src/protocol');

describe('NextionProtocol', function () {
  let sbx;

  beforeEach(function () {
    sbx = sinon.sandbox.create();
  });

  afterEach(function () {
    sbx.restore();
  });

  it('should construct an object', function () {
    expect(new NextionProtocol())
      .to
      .be
      .an('object');
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
      ])).buffer)
        .to
        .eql(Buffer.from([
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
          buf = Buffer.from([0xff]);
        });

        it('should throw', function () {
          expect(() => {
            nextion.read(buf)
              .commandName();
          })
            .to
            .throw(Error);
        });
      });

      describe('when given a known command', function () {
        let buf;

        beforeEach(function () {
          // page_id
          buf = Buffer.from([0x66]);
        });

        it('should not throw', function () {
          expect(() => {
            nextion.read(buf)
              .commandName();
          })
            .not
            .to
            .throw();
        });

        it('should return a result with a camel-cased "command" property',
          function () {
            expect(nextion.read(buf)
              .commandName().result)
              .to
              .have
              .property('command', 'pageId');
          });
      });
    });

    describe('response', function () {
      let buf;

      beforeEach(function () {
        buf = Buffer.from([0x66]);
        sbx.stub(nextion.reader, 'commandName', function () {
          this.context.command = 'foo';
        });
        nextion.reader.foo = sbx.spy(function () {
          this.context.data = {bar: 'baz'};
        });
      });

      it('should call "commandName" command', function () {
        nextion.read(buf)
          .response();
        expect(nextion.reader.commandName)
          .to
          .have
          .been
          .calledWithExactly();
      });

      it('should call the "foo" command', function () {
        nextion.read(buf)
          .response();
        expect(nextion.reader.foo)
          .to
          .have
          .been
          .calledWithExactly('data');
      });

      it('should return a result object containing command name and data',
        function () {
          expect(nextion.read(buf)
            .response().result)
            .to
            .eql({
              command: 'foo',
              data: {
                bar: 'baz'
              }
            });
        });
    });
  });

  describe('command', function () {
    let nextion;

    beforeEach(function () {
      nextion = new NextionProtocol();
    });

    describe('touchEvent', function () {
      let buf;
      beforeEach(function () {
        sbx.spy(nextion.reader, 'UInt8');
        buf = Buffer.from([
          0x00,
          0x02,
          0x01
        ]);
      });

      it('should parse three (3) UInt8 values', function () {
        nextion.read(buf)
          .touchEvent();
        expect(nextion.reader.UInt8).to.have.been.calledThrice;
      });

      it(
        'should return a result object containing number "page_id", number "button_id" and boolean "release_event"',
        function () {
          expect(nextion.read(buf)
            .touchEvent().result)
            .to
            .eql({
              page_id: 0,
              button_id: 2,
              release_event: true
            });
        });
    });

    describe('pageId', function () {
      let buf;
      beforeEach(function () {
        sbx.spy(nextion.reader, 'UInt8');
        buf = Buffer.from([
          0x03
        ]);
      });

      it('should parse one (1) UInt8 values', function () {
        nextion.read(buf)
          .pageId();
        expect(nextion.reader.UInt8).to.have.been.calledOnce;
      });

      it('should return a result object containing number "page_id"',
        function () {
          expect(nextion.read(buf)
            .pageId().result)
            .to
            .eql({
              page_id: 3
            });
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
            .stringData().result)
            .to
            .have
            .property('value', 'foobar');
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
          .numericData().result)
          .to
          .have
          .property('value', -132);
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
        expect(nextion.read(buf)
          .touchCoordinate().result)
          .to
          .eql({
            x_high: 1,
            x_low: 2,
            y_high: 3,
            y_low: 4,
            page_id: 5,
            button_id: 6,
            release_event: false
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
        expect(nextion.reader.touchCoordinate).to.have.been.calledOnce;
      });
    });
  });
});
