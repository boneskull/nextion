'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const {Nextion} = require('./nextion');
const {NextionProtocol} = require('./protocol');
const Serialport = require('serialport');
const listPorts = Promise.promisify(Serialport.list);

const DEFAULT_BAUD_RATE = 9600;
const PORT_GUESS_REGEX = /usb|acm|^com/i;

async function guessPort () {
  const ports = await listPorts();
  const validPorts = ports.map(port => port.comName)
    .filter(port => PORT_GUESS_REGEX.test(port));
  if (validPorts.length) {
    return validPorts.shift();
  }
}

function openPort (opts) {
  opts = _.defaults({
    parser: Serialport.parsers.byteDelimiter([
      0xff,
      0xff,
      0xff
    ]),
    baudRate: DEFAULT_BAUD_RATE
  }, opts);
  return new Promise((resolve, reject) => {
    /* eslint no-new:off */
    new Serialport(opts.port, opts, function (err) {
      if (err) {
        return reject(err);
      }
      resolve(this);
    });
  });
}

exports.createConnection = async function createConnection (opts = {}) {
  let port;

  if (_.isString(opts)) {
    opts = {
      port: opts
    };
  }

  if (_.isString(opts.port)) {
    port = await openPort(opts);
  } else if (_.isObject(opts.port)) {
    port = opts.port;
  } else {
    opts.port = await guessPort();
    if (!opts.port) {
      throw new Error('No suitable ports found');
    }
    port = await openPort(opts);
  }

  return new Nextion(port, opts);
};

exports.Nextion = Nextion;
exports.NextionProtocol = NextionProtocol;
