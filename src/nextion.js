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
      .on('event', (code, ...args) => {
        this.emit(code, ...args);
      });

    this.system = new System(uart);

    nDebug('Nextion ready');
  }

  setValue (variableName, value) {
    return this.uart.setValue(variableName, value);
  }

  setComponentValue (componentName, value) {
    return this.setVariableValue(`${componentName}.val`, value);
  }
}

Nextion.prototype.setVariableValue = Nextion.prototype.setValue;
