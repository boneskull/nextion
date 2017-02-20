import 'source-map-support/register';
import {Nextion} from './nextion';
import {NextionProtocol} from './protocol';
import {UART} from './uart';

Nextion.from = Nextion.create = async function from (port, opts = {}) {
  const uart = await UART.from(port, opts);
  return new Nextion(uart);
};

Nextion.fromSerial = async function fromSerial (serialPort, opts = {}) {
  const uart = await UART.fromSerial(serialPort, opts);
  return new Nextion(uart);
};

Nextion.fromPort = async function fromPort (portName, opts = {}) {
  const uart = await UART.fromPort(portName, opts);
  return new Nextion(uart);
};

Nextion.NextionProtocol = NextionProtocol;
Nextion.UART = UART;

export default Nextion;
