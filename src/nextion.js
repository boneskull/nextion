import {EventEmitter} from 'events';
import {System} from './system';
import debug from 'debug';

const nDebug = debug('nextion:Nextion');

export class Nextion extends EventEmitter {
  constructor (uart) {
    super();

    if (!uart) {
      throw new TypeError('"uart" must be a UART instance');
    }
    this.uart = uart.bind()
      .on('event', (...args) => {
        this.emit('event', ...args);
      });

    this.system = new System(uart);

    nDebug('Nextion ready');
  }

  async setValue (variableName, value) {
    return await this.uart.setValue(variableName, value);
  }

  async setComponentValue (componentName, value) {
    return await this.setVariableValue(`${componentName}.val`, value);
  }
}

Nextion.prototype.setVariableValue = Nextion.prototype.setValue;
