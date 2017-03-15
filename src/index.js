import {Nextion} from './nextion';
import {NextionProtocol} from './protocol';
import {UART} from './uart';

function instantiate (uart, opts) {
  return new Promise(resolve => {
    const nextion = new Nextion(uart, opts, () => {
      resolve(nextion);
    });
  });
}

Nextion.from = Nextion.create = (port, opts) => UART.from(port, opts)
  .then(instantiate);

Nextion.fromSerial = (serialPort, opts) => UART.fromSerial(serialPort, opts)
  .then(instantiate);

Nextion.fromPort = (portName, opts) => UART.fromPort(portName, opts)
  .then(instantiate);

Nextion.NextionProtocol = NextionProtocol;
Nextion.UART = UART;

module.exports = Nextion;
