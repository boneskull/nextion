'use strict';

const _ = require('lodash');
const promisify = require('es6-promisify');

let Serialport;
let listPorts;
try {
  Serialport = require('serialport');
  listPorts = promisify(Serialport.list);
} catch (ignored) {
}

const DEFAULT_BAUD_RATE = 9600;
const PORT_GUESS_REGEX = /usb|acm|^com/i;

async function guessPort () {
  const port = await listPorts();
  const validPorts = ports.filter(port => PORT_GUESS_REGEX.test(port))
    .map(port => port.comName);
  if (!validPorts.length) {
    throw new Error("Couldn't find a good serial port!");
  }
  return validPorts.shift();
}

function createConnection (opts = {}) {
  if (!(Serialport || opts.stream)) {
    throw new Error('serialport module not available; specify readable stream via "stream" option');
  }
  let serialport;
  if (opts.stream) {
    serialport = opts.stream;
  }
  opts = _.defaults({
    baudRate: 9600
  }, opts);

  if (!opts.port) {
    opts.port = guessPort();
  }
}

// 'use strict';
//
//
// const SerialPort = require('serialport');
//
// const port = new SerialPort('/dev/tty.SLAB_USBtoUART', {
//   baudRate: 9600,
//   parser: SerialPort.parsers.byteDelimiter([
//     0xff,
//     0xff,
//     0xff
//   ])
// }, function (err) {
//   if (err) {
//     throw new Error(err);
//   }
//   port.on('data', data => {
//     const result = NextionProtocol.read(Buffer.from(data.slice(0, -3)))
//       .response().result;
//     port.emit(result.command, result.data);
//   })
// });
//
