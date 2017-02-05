'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

const Serialport = require('serialport');
const listPorts = Promise.promisify(Serialport.list);

const DEFAULT_BAUD_RATE = 9600;
const PORT_GUESS_REGEX = /usb|acm|^com/i;
let IS_TESSEL = false;
try {
  require('tessel');
  IS_TESSEL = true;
} catch (ignored) {
}

async function guessPort () {
  const port = await listPorts();
  const validPorts = ports.filter(port => PORT_GUESS_REGEX.test(port))
    .map(port => port.comName);
  if (validPorts.length) {
    return validPorts.shift();
  }
}

module.exports = async function createConnection (opts = {}) {
  if (_.isString(opts)) {
    opts = {
      port: opts
    };
  }
  let serialport;
  let port = opts.port;
  if (opts.serialport) {
    serialport = opts.serialport;
  }
  opts = _.defaults({
    baudRate: 9600
  }, opts);

  if (!serialport) {
    if (!port) {
      port = await guessPort();
      if (!port) {
        if (IS_TESSEL) {
          throw new Error('Specify port "A" or "B" for Tessel 2');
        }
        throw new Error("Couldn't find a promising port!");
      }
    } else if (IS_TESSEL) {
      if (port === 'A') {
        port = '/dev/ttyS0';
      } else if (port === 'B') {
        port = '/dev/ttyS1';
      }
    }
    serialport = await new Promise((resolve, reject) => {
      new Serialport(port, {
        baudRate: opts.baudRate,
        parser: Serialport.parsers.byteDelimiter([0xff,0xff,0xff])
      }, function (err) {
        if (err) {
          return reject(err);
        }
        resolve(this);
      });
    });
  }

  return new Nextion(serialport);
}
