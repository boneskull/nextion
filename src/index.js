import 'source-map-support/register';
import {Nextion} from './nextion';
import {NextionProtocol} from './protocol';
import {UART} from './uart';

Nextion.from = Nextion.create = function from (port, opts = {}) {
  return UART.from(port, opts)
    .then(uart => new Nextion(uart));
};

Nextion.fromSerial = function fromSerial (serialPort, opts = {}) {
  return UART.fromSerial(serialPort, opts)
    .then(uart => new Nextion(uart));
};

Nextion.fromPort = function fromPort (portName, opts = {}) {
  return UART.fromPort(portName, opts)
    .then(uart => new Nextion(uart));
};

Nextion.NextionProtocol = NextionProtocol;
Nextion.UART = UART;

module.exports = Nextion;
