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
          .response()
        expect(nextion.reader.commandName)
          .to
          .have
          .been
          .calledWithExactly('command');
      });

      it('should call the "foo" command', function () {
        nextion.read(buf)
          .response()
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

    describe('touch', function () {
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
          .touch();
        expect(nextion.reader.UInt8).to.have.been.calledThrice;
      });

      it(
        'should return a result object containing number "page_id", number "button_id" and boolean "release_event"',
        function () {
          expect(nextion.read(buf)
            .touch().result)
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
          0x03,
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
              page_id: 3,
            });
        });
    });
  });
});
