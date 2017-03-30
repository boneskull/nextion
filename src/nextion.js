import {EventEmitter} from 'events';
import {System} from './system';
import debug_ from 'debug';
import _ from 'lodash/fp';

/**
 * @ignore
 */
const debug = debug_('nextion:Nextion');

/**
 * Applies defaults to an object
 * @param {NextionOptions} obj - Defaults are applied to this object
 * @returns {NextionOptions} Options w/ defaults applied
 * @function
 * @private
 */
const applyDefaults = _.defaults({
  // XXX: does nothing yet
  enhanced: true
});

/**
 * High-level abstraction for interacting with a Nextion device.
 * @extends {EventEmitter}
 */
export class Nextion extends EventEmitter {
  /**
   * Begins listening for data via a {@link UART} instance.
   * @param {UART} uart - {@link UART} instance
   * @param {Object|Function} [opts] - Options or `connectListener`
   * @param {Function} [connectListener] - Callback to run when listening for
   *   Nextion data
   * @emits {error} When binding via `uart` fails
   * @throws {ReferenceError} When `uart` is missing
   */
  constructor (uart, opts = {}, connectListener = _.noop) {
    if (!uart) {
      throw new ReferenceError(
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

    /**
     * Options
     * @type {Object}
     * @private
     */
    this.opts = applyDefaults(opts);

    /**
     * Internal UART instance
     * @type {UART}
     * @private
     */
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

    /**
     * System-level Nextion commands
     * @type {System}
     */
    this.system = new System(uart);

    debug('Instantiated');
  }

  /**
   * Sets a local or global variable on the current page to a value
   * @param {string} name - Name of variable
   * @param {*} [value] - New variable value
   * @returns {Promise<ResponseResult<*>,Error>} Result
   */
  setValue (name, value) {
    return this.uart.setValue(name, value);
  }

  /**
   * Sets a the value of a local component
   * @param {string} name - Name of component
   * @param {*} [value] - New component value
   * @returns {Promise<ResponseResult<*>,Error>} Result
   */
  setComponentValue (name, value) {
    return this.setVariableValue(`${name}.val`, value);
  }

  /**
   * Get a value
   * @param {string} name - Name; can be `varName.val` or `component.txt`, etc.
   * @returns {Promise<ResponseResult<StringData|NumericData>,Error>} String or
   *   numeric data response (depending on variable's type)
   */
  getValue (name) {
    return this.uart.getValue(name);
  }

  /**
   * Closes connection to Nextion device.
   * @returns {Promise<Nextion>} This instance
   */
  close () {
    return this.uart.unbind()
      .then(() => {
        return this;
      });
  }
}

Nextion.prototype.setVariableValue = Nextion.prototype.setValue;
