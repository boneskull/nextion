import {createProtocol} from 'bin-protocol';
import {eventCodeMap, responseCodeMap} from './codes';
import _ from 'lodash/fp';
import debug_ from 'debug';
import {hexStr} from './util';
const debug = debug_('nextion:protocol');

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
  eventCode () {
    this.byte('code');
    return eventCodeMap.get(String(this.context.code));
  },
  responseCode () {
    this.byte('code');
    return responseCodeMap.get(String(this.context.code));
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
  const code = data.readUInt8(0);
  debug('Code:', hexStr(code));
  let name = responseCodeMap.get(String(code));
  if (name) {
    return {
      name,
      codeByte: hexStr(code),
      code,
      type: 'response'
    };
  }
  name = eventCodeMap.get(String(code));
  if (name) {
    const result = {
      name,
      codeByte: hexStr(code),
      code,
      type: 'event'
    };
    const reader = nextionProtocol.read(data.slice(1));
    if (_.isFunction(reader[name])) {
      result.data = reader[name]().result;
    }
    return result;
  }
  throw new Error(`Unknown data received: ${data.toString()}`);
}

export const nextionProtocol = new NextionProtocol();

export {NextionProtocol};

export const delimiter = [
  0xff,
  0xff,
  0xff
];
export const delimiterBuffer = Buffer.from(delimiter);
