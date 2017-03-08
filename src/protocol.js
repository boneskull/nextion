import {createProtocol} from 'bin-protocol';
import {eventCodeMap, executionCodeMap} from './codes';
import _ from 'lodash/fp';

const NextionProtocol = createProtocol(function () {
  // this is mostly here for the convenience of a 3p consumer.
  // TODO: document
  const reset = this.reader.reset;
  this.reader.reset = function (buf) {
    if (buf.slice(buf.length - 3)
        .equals(delimiterBuffer)) {
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
    const code = eventCodeMap.get(String(this.context.code));
    if (!code) {
      throw new Error(`Unknown code: ${this.context.code}`);
    }
    return code;
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

export function readEvent (data) {
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

export function readExecValue (data) {
  if (!Buffer.isBuffer(data)) {
    data = Buffer.from(data);
  }
  const code = executionCodeMap.has(String(data.slice(0, 1)));
  if (!code) {
    return {code: 'unknownResult', data: data};
  }
  return {code};
}

export const nextionProtocol = new NextionProtocol();

export {NextionProtocol};

export const delimiter = [0xff, 0xff, 0xff];
export const delimiterBuffer = Buffer.from(delimiter);
