import {createProtocol} from 'bin-protocol';
import {eventCodeMap, responseCodeMap} from './codes';
import _ from 'lodash/fp';
import debug_ from 'debug';
import {toHex} from './util';

/**
 * @ignore
 */
const trace = debug_('trace:nextion:protocol');

/**
 * @ignore
 * @todo document
 */
const NextionProtocolClass = createProtocol(function () {
  // this is mostly here for the convenience of a 3p consumer.
  const reset = this.reader.reset;
  this.reader.reset = function (buf) {
    if (buf.slice(buf.length - 3)
        .equals(delimiterBuffer)) {
      return reset.call(this, buf.slice(0, -3));
    }
    return reset.call(this, buf);
  };
});

/**
 * A [bin-protocol](https://npmjs.com/package/bin-protocol) `Protocol` class
 * which decodes Nextion-speak.
 * @see https://npmjs.com/package/bin-protocol
 * @example
 * const protocolInstance = new NextionProtocol();
 */
class NextionProtocol {
  /**
   * Constructs a {@link NextionProtocol} instance.
   */
  constructor () {
    return new NextionProtocolClass();
  }
}

/**
 * Result of `stringData` response.
 * @typedef {Object} StringData
 * @property {string} value - String result value
 */

/**
 * Result of `numericData` response.
 * @typedef {Object} NumericData
 * @property {number} value - Numeric result value
 */

/**
 * Namespace of "read" functions which are supported by {@link NextionProtocol}.
 * @todo Document the shape of the event data
 * @private
 */
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
    NextionProtocolClass.define(name, {
      read: readers[name]
    });
  });

/**
 * Generic response or event from Nextion device.
 * @abstract
 * @example
 * const result = new Result(0x01); // success
 */
class Result {
  /**
   * Creates a {@link Result}.
   * @param {number} code - Decimal instruction code
   */
  constructor (code) {
    /**
     * Decimal representation of instruction code.
     * @type {number}
     */
    this.code = code;
  }

  /**
   * Hexadecimal representation of instruction code.
   * @type {string}
   */
  get hex () {
    return toHex(this.code);
  }
}

/**
 * An "event" from a Nextion device.
 */
class EventResult extends Result {
  /**
   * Creates an EventResult.
   * @param {number} code - Decimal instruction code
   * @param {*} [data] - Any other data returned by result
   */
  constructor (code, data) {
    super(code);

    /**
     * Human-readable short name of this event.
     * @type {string}
     */
    this.name = eventCodeMap.get(String(code));

    /**
     * Any other data returned by result
     * @type {*|void}
     */
    this.data = data;
  }
}

/**
 * A response, either success or an error, from a command.
 */
class ResponseResult extends Result {
  /**
   * Creates a ResponseResult.
   * @param {number} code - Decimal instruction code
   * @param {*} [data] - Any other data returned by result
   */
  constructor (code, data) {
    super(code);

    /**
     * Human-readable short name of this response.
     * @type {string}
     */
    this.name = responseCodeMap.get(String(code));

    /**
     * Any other data returned by result
     * @type {*|void}
     */
    this.data = data;
  }
}

/**
 * Parse an event or response from a Nextion device.
 * @param {Buffer} buf - Raw `Buffer` from Nextion device
 * @returns {Result} - Parsed result
 * @throws {TypeError} When unknown data received from device
 * @private
 */
export function read (buf) {
  const code = buf.readUInt8(0);
  trace('Code:', toHex(code));
  const codeStr = String(code);
  let result;
  if (responseCodeMap.has(codeStr)) {
    result = new ResponseResult(code);
  } else if (eventCodeMap.has(codeStr)) {
    result = new EventResult(code);
  }

  if (result) {
    const reader = nextionProtocol.read(buf.slice(1));
    if (_.isFunction(reader[result.name])) {
      result.data = reader[result.name]().result;
    }
    return result;
  }

  throw new TypeError(`Unknown data received: ${buf.toString()}`);
}

/**
 * This instance is used internally.
 * @type {NextionProtocol}
 * @private
 */
export const nextionProtocol = new NextionProtocol();

export {NextionProtocolClass as NextionProtocol};

/**
 * This is the byte delimiter all Nextion data ends with.
 * @type {number[]}
 * @private
 */
export const delimiter = [
  0xff,
  0xff,
  0xff
];

/**
 * Buffer wrapper of {@link delimiter}.
 * @private
 * @type {Buffer}
 */
export const delimiterBuffer = Buffer.from(delimiter);
