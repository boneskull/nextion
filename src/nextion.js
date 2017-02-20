import {EventEmitter} from 'events';
import {System} from './system';

export class Nextion extends EventEmitter {
  constructor (uart) {
    super();

    if (!uart) {
      throw new TypeError('"uart" must be a UART instance');
    }
    this.uart = uart.bind();

    this.system = new System(uart);
  }

  async setValue (variableName, value) {
    return await this.uart.setValue(variableName, value);
  }

  async setComponentValue (componentName, value) {
    return await this.setVariableValue(`${componentName}.val`, value);
  }
}

Nextion.prototype.setVariableValue = Nextion.prototype.setValue;
