import {Nextion} from './nextion';
import {NextionProtocol} from './protocol';
import {UART} from './uart';

/**
 * @external {EventEmitter} https://nodejs.org/api/events.html#events_class_eventemitter
 */

/**
 * @external {Duplex} https://nodejs.org/api/stream.html#stream_class_stream_duplex
 */

/**
 * @external {Serialport} https://npmjs.com/package/serialport
 */

/**
 * @external {Buffer} https://nodejs.org/api/buffer.html#buffer_class_buffer
 */

/**
 * Valid options to supply a {@link Nextion} or {@link UART} constructor.
 * All options are optional.
 * @typedef {Object} NextionOptions
 * @property {string} [port] - Name (e.g. "COM3") or path (e.g. "/dev/ttyUSB0")
 * @property {number} [baudRate=9600] - Baud rate of Nextion device.
 */

/**
 * Instantiates a Nextion instance and fulfills a Promise
 * when it's listening for data.
 * @param {UART} uart - UART instance
 * @param {NextionOptions} [opts] - Extra options
 * @private
 * @returns {Promise<Nextion>} New Nextion instance
 */
function instantiate (uart, opts) {
  return new Promise(resolve => {
    const nextion = new Nextion(uart, opts, () => {
      resolve(nextion);
    });
  });
}

/**
 * Create a Nextion instance.
 * @param {string|Object} [port] - Name of port (`COM1`, `/dev/tty.usbserial`, etc.), `Serialport` instance or `Duplex` stream.  Omit for autodetection.
 * @param {NextionOptions} [opts] - Options
 * @returns {Promise<Nextion>} - Nextion instance
 */
Nextion.from = (port, opts) => UART.from(port, opts)
  .then(instantiate);
Nextion.create = Nextion.from;

/**
 * Create a Nextion instance using an existing connected `Serialport` instance or `Duplex` stream.
 * @param {string} serialPort - `Serialport` instance, `Duplex` stream, etc.
 * @param {NextionOptions} [opts] - Options
 * @returns {Promise<Nextion>} - Nextion instance
 */
Nextion.fromSerial = (serialPort, opts) => UART.fromSerial(serialPort, opts)
  .then(instantiate);

/**
 * Create a Nextion instance, optionally specifying a port name.
 * @param {string} [portName] - Name of port (`COM1`, `/dev/tty.usbserial`, etc.).  Omit for autodetection.
 * @param {NextionOptions} [opts] - Options
 * @returns {Promise<Nextion>} - Nextion instance
 */
Nextion.fromPort = (portName, opts) => UART.fromPort(portName, opts)
  .then(instantiate);

Nextion.NextionProtocol = NextionProtocol;
Nextion.UART = UART;

module.exports = Nextion;
