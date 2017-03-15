import {EventEmitter} from 'events';
import Serialport from 'serialport';
import _ from 'lodash/fp';
import {delimiter, delimiterBuffer, read} from './protocol';
import debug_ from 'debug';
import pMapSeries from 'p-map-series';
import pify from 'pify';

/**
 * Factory default baud rate of Nextion is 9600
 * @type {number}
 */
export const DEFAULT_BAUD_RATE = 9600;

/**
 * This tells the Nextion to return a command result even if command succeeded
 * @type {string}
 */
export const DEFAULT_RETURN_COMMAND_RESULT = 'always';

/**
 * Timeout in ms we should wait for response from Nextion for various requests
 * @type {number}
 */
export const REQUEST_TIMEOUT = 1000;

const PORT_GUESS_REGEX = /usb|acm|^com/i;
const txDebug = debug_('nextion:UART:TX');
const rxDebug = debug_('nextion:UART:RX');
const debug = debug_('nextion:UART');

const isValidPort = _.allPass([
  _.isObject,
  _.pipe(_.property('on'), _.isFunction),
  _.pipe(_.property('write'), _.isFunction)
]);

const applyDefaults = _.defaults({
  returnCommandResult: DEFAULT_RETURN_COMMAND_RESULT,
  baudRate: DEFAULT_BAUD_RATE
});

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

    this.opts = applyDefaults(opts);
    this.port = port;

    this.on('data', data => {
      try {
        const result = read(data);
        if (result.type === 'event') {
          rxDebug(`Event "${result.name}" (${result.codeByte}); data:`,
            result.data);
          this.emit('event', result);
        } else {
          rxDebug(`Response "${result.name}" (${result.codeByte})`);
          this.emit('response', result);
        }
      } catch (err) {
        this.emit('error', err);
      }
    });

    // Is there a better way to do this?
    const waitForReadiness = () => {
      this.ready = new Promise(resolve => {
        this.once('connected', () => {
          debug('UART ready!');
          this.once('disconnect', () => {
            debug('UART disconnected!');
            waitForReadiness();
          });
        });
        resolve();
      });
    };

    waitForReadiness();
  }

  /**
   * Set variable `variableName` to value `value`.
   * Corrects booleans to 0/1.
   * @param {string} variableName - Name of variable, component, system var,
   *   page, etc.
   * @param {*} [value] - Will be coerced to a string.
   * @returns {Promise<*>}
   * @public
   */
  setValue (variableName, value) {
    return this.ready.then(() => {
      if (value === true) {
        value = 1;
      } else if (value === false) {
        value = 0;
      }
      return this.request(`${variableName}=${value}`);
    });
  }

  /**
   * Wraps serial port's write() in a Promise
   * @param {Buffer} data - Data to write
   * @returns {Promise<UART>} UART instance
   * @private
   */
  write (data) {
    return new Promise((resolve, reject) => {
      if (!Buffer.isBuffer(data)) {
        return reject(new Error('Expected Buffer'));
      }
      txDebug('Writing:', data);
      this.port.write(data, err => {
        if (err) {
          return reject(err);
        }
        this.port.drain(err => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    })
      .then(() => {
        txDebug('Wrote:', data || '(empty string)');
        return this;
      });
  }

  /**
   * Sends a raw command; does not wait for response.
   * @param {string} [command] - Raw ASCII command, or nothing at all
   * @private
   * @returns {Promise<UART>}
   */
  send (command = '') {
    txDebug('Sending:', command);
    return this.write(Buffer.concat([
      Buffer.from(command),
      delimiterBuffer
    ]))
      .then(() => {
        txDebug('Sent:', command || '(empty string)');
        return this;
      });
  }

  /**
   * Makes a request to a Nextion device, expecting a response.
   * @param {Array<string>|string} commands - Command(s) to execute
   * @public
   * @returns {Promise<*>} Result or array of results
   */
  request (commands = []) {
    return this.ready.then(() => {
      commands = [].concat(commands);
      return pMapSeries(commands, command => {
        txDebug('Beginning request');
        return new Promise((resolve, reject) => {
          const handler = result => {
            rxDebug('Received', result);
            clearTimeout(t);
            return resolve(result);
          };

          this.once('response', handler);

          const t = setTimeout(() => {
            this.removeListener('response', handler);
            reject(new Error(`Timeout of ${REQUEST_TIMEOUT}ms exceeded`));
          }, REQUEST_TIMEOUT);

          this.send(command)
            .catch(err => {
              this.removeListener('response', handler);
              reject(err);
            });
        });
      });
    })
      .then(results => commands.length === 1
        ? results.shift()
        : results);
  }

  /**
   * Begins listening for data on the open serial port.
   * If an event is emitted from the Nextion device, an event with a
   * human-readable name will be emitted, along with any extra data, if
   * present.
   * Errors bubble up from the serial port object thru the UART instance.
   * @param {events.EventEmitter|stream.Duplex} [port] - `Serialport`-like
   *   object to listen for data and errors on.  Defaults to {@link UART#port}.
   * @public
   * @returns {Promise<UART>}
   */
  bind (port) {
    port = port || this.port;
    let nextDelimiterIndex = 0;
    let buf = [];
    port.on('data', data => {
      rxDebug('Raw data:', data);
      // this is torn from serialport's byte delimiter parser, considering
      // we aren't ensured a Serialport object.
      Array.from(data)
        .forEach(byte => {
          buf.push(byte);
          if (_.last(buf) === delimiter[nextDelimiterIndex]) {
            nextDelimiterIndex++;
          }
          if (nextDelimiterIndex === delimiter.length) {
            buf = Buffer.from(buf);
            rxDebug('Parsed data:', buf);
            this.emit('data', buf);
            buf = [];
            nextDelimiterIndex = 0;
          }
        });
    })
      .on('error', err => {
        this.emit('error', err);
      })
      .on('close', () => {
        this.emit('disconnect');
        this.port = null;
        delete this.port;
      })
      .on('disconnect', err => {
        this.emit('error', err);
      });

    debug('Configuring device...');
    return this.send('sleep=0')
      .then(() => this.setReturnCommandResult(this.opts.returnCommandResult))
      .then(() => {
        this.emit('connected');
        return this;
      });
  }

  /**
   * Tell the Nextion device to wait (default) or not wait for responses when
   * requests are made.
   * @param {string|number|boolean} [value='always'] - false, 0 or "none" to
   *   disable waiting for responses; true, 1 or "always" to enable waiting for
   *   responses.
   * @private
   * @returns {Promise<UART>}
   */
  setReturnCommandResult (value = 'always') {
    let commandValue;

    switch (value) {
      case false:
      case 0:
      // falls through
      case 'none':
        commandValue = 0;
        break;
      case 3:
      case true:
      // falls through
      case 'always':
      default:
        commandValue = 3;
    }

    return this.send(`bkcmd=${commandValue}`)
      .then(() => {
        this.opts.returnCommandResult = value;
        debug(`returnCommandResult is now "${value}"`);
        return this;
      });
  }

  /**
   * Stops listening on the serial port, closes it, destroys the reference,
   * kills a kitten, etc.
   * @returns {Promise<UART>}
   * @public
   */
  unbind () {
    const port = this.port;
    this.port = null;
    delete this.port;
    if (_.isFunction(port.close)) {
      return pify(port.close.bind(port))()
        .then(() => {
          this.emit('disconnect');
          return this;
        });
    }
    this.emit('disconnect');
    return Promise.resolve(this);
  }

  /**
   * Given a {@link Serialport}-like object, create a {@link UART} wrapper.
   * Returns a `Promise` for consistency.
   * @param {events.EventEmitter|stream.Duplex} serialPort - Serial port
   *   interface
   * @param {UARTOptions} [opts={}] - Options
   * @public
   * @returns {Promise.<UART>}
   */
  static fromSerial (serialPort, opts = {}) {
    return Promise.resolve(new UART(serialPort, opts));
  }

  /**
   * Given a serial port name or path, or object containing one, create a
   * `Serialport` instance, open the serial port, then return a `UART`
   * instance.
   * If no port name is present, we'll try to detect the port.
   * @param {string|UARTOptions} [portName] - Serial port name or path, or
   *   options
   * @param {UARTOptions} [opts={}] - Options
   * @public
   * @returns {Promise.<UART>}
   */
  static fromPort (portName, opts = {}) {
    if (_.isObject(portName)) {
      opts = portName;
      portName = portName.port;
    }

    opts = applyDefaults(opts);

    if (portName) {
      return new Promise((resolve, reject) => {
        debug(`Opening port "${portName}" with opts`, opts);
        const serialPort = new Serialport(portName, opts, err => {
          if (err) {
            return reject(err);
          }
          resolve(serialPort);
        });
      })
        .then(serialPort => {
          debug(`Opened connection to port "${portName}"`);
          return UART.fromSerial(serialPort, _.assign(opts, {portName}));
        });
    } else {
      return UART.findPort()
        .then(portName => {
          if (!portName) {
            throw new Error('Could not find a serial device!');
          }
          return UART.fromPort(portName, opts);
        });
    }
  }

  /**
   * Convenience wrapper of {@link UART.fromPort} and {@link UART.fromSerial}.
   * @param {string|events.EventEmitter|stream.Duplex|UARTOptions} [port] - Port
   * @param {UARTOptions} [opts] - Options
   * @public
   * @returns {Promise<UART>}
   */
  static from (port, opts = {}) {
    return isValidPort(port)
      ? UART.fromSerial(port, opts)
      : UART.fromPort(port, opts);
  }

  /**
   * Tries to find a device on a serial/COM port.
   * @returns {Promise<string|void>} - Name/path of promising serial port, if
   *   any
   * @private
   */
  static findPort () {
    return pify(Serialport.list)()
      .then(_.pipe(_.pluck('comName'),
        _.filter(portName => PORT_GUESS_REGEX.test(portName)), _.head));
  }
}
