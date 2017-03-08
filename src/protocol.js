import {createProtocol} from 'bin-protocol';
import {codes} from './codes';
import _ from 'lodash/fp';

const NextionProtocol = createProtocol(function () {
  const reset = this.reader.reset;
  this.reader.reset = function (buf) {
    if (buf.slice(buf.length - 3)
        .equals(endCommandBuffer)) {
      return reset.call(this, buf.slice(0, -3));
    }
    return reset.call(this, buf);
  };
});

const readers = {
  byte (name) {
    this.UInt8(name);
  },
  code () {
    this.byte('code');
    if (!codes[this.context.code]) {
      throw new Error(`Unknown code: ${this.context.code}`);
    }
    return codes[this.context.code];
  },
  touchEvent () {
    this.pageId()
      .byte('buttonId')
      .byte('releaseEvent');
    this.context.releaseEvent = Boolean(this.context.releaseEvent);
  },
  pageId () {
    this.byte('pageId');
  },
  touchCoordinate () {
    this.byte('xHigh')
      .byte('xLow')
      .byte('yHigh')
      .byte('yLow')
      .byte('releaseEvent');
    this.context.releaseEvent = Boolean(this.context.releaseEvent);
  },
  touchCoordinateOnWake () {
    this.touchCoordinate();
  },
  stringData () {
    this.context.value = this.buffer.toString();
  },
  numericData () {
    this.Int16LE('value');
  }
};

Object.keys(readers)
  .forEach(name => {
    NextionProtocol.define(name, {
      read: readers[name]
    });
  });

export function read (data) {
  if (!Buffer.isBuffer(data)) {
    data = Buffer.from(data);
  }
  const codeByte = data.slice(0, 1);
  const code = nextionProtocol.read(codeByte)
    .code().result;
  const result = {
    code
  };
  const reader = nextionProtocol.read(data.slice(1));
  if (_.isFunction(reader[code])) {
    result.data = reader[code]().result;
  }
  return result;
}

export const nextionProtocol = new NextionProtocol();

export {NextionProtocol};

export const endCommand = [0xff, 0xff, 0xff];
export const endCommandBuffer = Buffer.from(endCommand);
