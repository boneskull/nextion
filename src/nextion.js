import {EventEmitter} from 'events';
import {System} from './system';
import debug_ from 'debug';
import _ from 'lodash/fp';

const debug = debug_('nextion:Nextion');

const applyDefaults = _.defaults({
  // XXX: does nothing yet
  enhanced: true
});

export class Nextion extends EventEmitter {
  /**
   *
   * @param {UART} uart - UART instance (serial port wrapper)
   * @param {Object|Function} [opts] - Options or `connectListener`
   * @param {Function} [connectListener] - Callback to run when listening for
   *   Nextion data
   */
  constructor (uart, opts = {}, connectListener = _.noop) {
    if (!uart) {
      throw new Error(
        'Invalid parameters; Use Nextion.from(), Nextion.fromSerial(), or Nextion.fromPort()');
    }

    super();

    if (_.isFunction(opts)) {
      connectListener = opts;
      opts = {};
    }

    this.on('connected', () => {
      debug('Nextion ready!');
      connectListener();
    });

    this.opts = applyDefaults(opts);
    this.uart = uart;

    // when a Nextion event occurs, re-emit it with event name
    uart.on('event', result => {
      debug(`Emitting event "${result.name}"`);
      this.emit(result.name, result.data);
    })
      .on('disconnected', () => {
        debug('Nextion disconnected!');
      })
      .bind()
      .then(() => {
        this.emit('connected');
      })
      .catch(err => {
        this.emit('error', err);
      });

    this.system = new System(uart);

    debug('Instantiated');
  }

  /**
   * Sets a variable on the current page to a value
   * @param {string} name - Name of variable
   * @param {*} [value] - Value to set variable to
   * @returns {Promise.<*>}
   */
  setValue (name, value) {
    return this.uart.setValue(name, value);
  }

  setComponentValue (componentName, value) {
    return this.setVariableValue(`${componentName}.val`, value);
  }

  close () {
    return this.uart.unbind()
      .then(() => {
        return this;
      });
  }
}

Nextion.prototype.setVariableValue = Nextion.prototype.setValue;
