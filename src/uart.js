import {EventEmitter} from 'events';
import Serialport from 'serialport';
import _ from 'lodash/fp';
import {endCommand, endCommandBuffer, read} from './protocol';
import Promise from 'bluebird';
import debug from 'debug';

export const DEFAULT_BAUD_RATE = 9600;
export const DEFAULT_PARSER = Serialport.parsers.byteDelimiter(endCommand);

const PORT_GUESS_REGEX = /usb|acm|^com/i;

const txDebug = debug('nextion:uart:tx');
const rxDebug = debug('nextion:uart:rx');

const isValidPort = _.allPass([
  _.isObject,
  _.pipe(_.property('on'), _.isFunction),
  _.pipe(_.property('write'), _.isFunction)
]);

/**
 * Whether or not to expect the Nextion device to return success/failure codes
 * after each serial command.  Defaults to "always".
 * @typedef {string|boolean|number} ReturnCommandResultValue
 */

/**
 * Options for creating a UART option.  Some properties may be ignored if a
 * Serialport or similar object has been provided when calling the factory
 * functions.
 * @typedef {Object} UARTOptions
 * @property {ReturnCommandResultValue} returnCommandResult - Value
 * @property {string} port - Name (e.g. "COM3") or path (e.g. "/dev/ttyUSB0")
 * @property {number} baudRate - Defaults to 9600
 * @property {Function} parser - Serialport parser; defaults to byte delimiter
 */

/**
 * Wraps a SerialPort or similar object; provides convenience methods for
 * interaction with a Nextion over UART.
 */
export class UART extends EventEmitter {

  /**
   * Sets some default options
   * @param {events.EventEmitter|stream.Duplex} port - Serial port interface
   * @param {UARTOptions} [opts={}] - Options
   */
  constructor (port, opts = {}) {
    super();

    if (!isValidPort(port)) {
      throw new TypeError('"port" must be a Serialport-like object');
    }

    this.port = port;

    this.opts = _.defaults({
      returnCommandResult: 'always'
    }, opts);
  }

  get returnCommandResult () {
    return this.opts.returnCommandResult;
  }

  set returnCommandResult (value) {
    this.setReturnCommandResult(value);
  }

  /**
   * Asserts {@link UART#port} is open.
   * @throws {Error} Port object must be truthy and not closed.
   */
  assertPortOpen () {
    if (!this.port || this.port.isClosed === true) {
      throw new Error('port not open!');
    }
  }

  /**
   * Set variable `variableName` to value `value`.
   * @param {string} variableName - Name of variable, component, system var,
   *   page, etc.
   * @param {*} value - Likely a primitive.
   * @returns {Promise<*>}
   */
  async setValue (variableName, value) {
    return this.request(`${variableName}=${value}`);
  }

  /**
   * Sends a raw command; does not wait for response.  Unless you really can't
   * guarantee a response, don't use this method, and use {@link UART#request}
   * instead.
   * @param {string} command - Raw ASCII command
   * @returns {UART}
   * @fires UART#error
   */
  send (command) {
    try {
      this.assertPortOpen();
      this.port.write(command);
      this.port.write(endCommandBuffer);
      txDebug(`Sent: ${command}`);
    } catch (err) {
      /**
       * Emitted if {@link UART#assertPortOpen} throws.
       * @type Error
       * @event UART#error
       */
      this.emit('error', err);
    }
    return this;
  }

  /**
   * Makes a request to a Nextion device, expecting a response.
   * @param {Array<string>|string} commands - Command(s) to execute
   * @returns {Promise<*>} Result or array of results
   */
  async request (commands = []) {
    try {
      this.assertPortOpen();
    } catch (err) {
      this.emit('error', err);
      return;
    }
    commands = [].concat(commands);
    const results = await Promise.map(commands, command => {
      this.send(command);
      return new Promise(resolve => {
        this.port.once('data', data => {
          const result = read(data);
          rxDebug(`Received: %j`, result);
          resolve(result);
        });
      });
    }, {concurrency: 1});
    return commands.length === 1 ? results.shift() : results;
  }

  /**
   * Begins listening for data on the open serial port.
   * If an event is emitted from the Nextion device, an event with a
   * human-readable name will be emitted, along with any extra data, if
   * present.
   * Errors bubble up from the serial port object thru the UART instance.
   * @param {events.EventEmitter|stream.Duplex} [port] - `Serialport`-like
   *   object to listen for data and errors on.  Defaults to {@link UART#port}.
   * @returns {UART}
   */
  bind (port) {
    port = port || this.port;

    port.on('data', data => {
      if (!Array.isArray(data)) {
        this.emit('error', new Error('Invalid data; expected array of bytes'));
        return;
      }
      try {
        const result = read(data);
        this.emit(result.code, result.data);
      } catch (err) {
        this.emit('error', err);
      }
    });

    port.on('error', err => {
      this.emit('error', err);
    });

    return this;
  }

  /**
   * Tell the Nextion device to wait (default) or not wait for responses when
   * requests are made.
   * @param {string|number|boolean} [value='always'] - false, 0 or "none" to
   *   disable waiting for responses; true, 1 or "always" to enable waiting for
   *   responses.
   * @returns {UART}
   */
  setReturnCommandResult (value = 'always') {
    let newValue;
    switch (value) {
      case false:
      case 0:
      // falls through
      case 'none':
        newValue = 0;
        break;
      case 3:
      case true:
      // falls through
      case 'always':
      default:
        newValue = 3;
    }
    this.send(`bkcmd=${newValue}`);
    this.opts.returnCommandResult = value;
  }

  /**
   * Stops listening on the serial port, closes it, destroys the reference,
   * etc.
   * @returns {UART}
   */
  unbind () {
    this.port.removeAllListeners('data');
    this.port.removeAllListeners('error');
    if (_.isFunction(this.port.close)) {
      this.port.close();
    }
    this.port = null;
    delete this.port;
    return this;
  }

  /**
   * Given a {@link Serialport}-like object, create a {@link UART} wrapper.
   * Returns a `Promise` for consistency.
   * @param {events.EventEmitter|stream.Duplex} serialPort - Serial port
   *   interface
   * @param {UARTOptions} [opts={}] - Options
   * @returns {Promise.<UART>}
   */
  static async fromSerial (serialPort, opts = {}) {
    return new UART(serialPort, opts);
  }

  /**
   * Given a serial port name or path, or object containing one, create a
   * `Serialport` instance, open the serial port, then return a `UART`
   * instance.
   * If no port name is present, we'll try to detect the port.
   * @param {string|UARTOptions} [portName] - Serial port name or path, or
   *   options
   * @param {UARTOptions} [opts={}] - Options
   * @returns {Promise.<UART>}
   */
  static async fromPort (portName, opts = {}) {
    if (_.isObject(portName)) {
      opts = portName;
      portName = portName.port;
    }

    opts = _.defaults({
      parser: DEFAULT_PARSER,
      baudRate: DEFAULT_BAUD_RATE
    });

    if (!portName) {
      portName = await UART.findPort();
      if (!portName) {
        throw new Error('Could not find a serial device!');
      }
    }

    const serialPort = await Promise.fromNode(done => {
      // eslint-disable-next-line no-new
      new Serialport(portName, opts, done);
    });

    return UART.fromSerial(serialPort, opts);
  }

  /**
   * Convenience wrapper of {@link UART.fromPort} and {@link UART.fromSerial}.
   * @param {string|events.EventEmitter|stream.Duplex|UARTOptions} [port] - Port
   * @param {UARTOptions} [opts] - Options
   * @returns {Promise.<UART>}
   */
  static async from (port, opts = {}) {
    return _.isObject(port) && _.isFunction(port.on) ? UART.fromSerial(port,
      opts) : UART.fromPort(port, opts);
  }

  /**
   * Tries to find a device on a serial/COM port.
   * @returns {Promise<string|void>} Name/path of promising serial port, if any
   */
  static async findPort () {
    const allPorts = await Promise.fromNode(Serialport.list);
    return _.pipe(_.pluck('comName'),
      _.filter(portName => PORT_GUESS_REGEX.test(portName)), _.head)(allPorts);
  }
}
