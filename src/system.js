import _ from 'lodash/fp';
import {EventEmitter} from 'events';
import {isUnsignedInteger, MAX_INT} from './util';
import ease from 'eases/sine-in-out';
import debug_ from 'debug';
import pMapSeries from 'p-map-series';
const debug = debug_('nextion:System');

/**
 * These are the names of the internal system variables.
 * @type {string[]}
 * @private
 */
export const SYSTEM_VARIABLES = [
  'sys0',
  'sys1',
  'sys2'
];

/**
 * System-level Nextion device functionality.
 * @extends {EventEmitter}
 */
export class System extends EventEmitter {
  /**
   * Creates a {@link System} instance.
   * @param {UART} uart - UART instance.
   */
  constructor (uart) {
    super();

    this.uart = uart;
  }

  /**
   * Sets value of system variable.
   * @param {string} name - Name of system variable; either `sys0`, `sys1`, or
   *   `sys2`.
   * @param {number} value - Must be an unsigned integer less than or equal to
   *   `4294967295`.
   * @returns {Promise<ResponseResult,TypeError>} Response or {@link TypeError}
   *   if invalid `name` or `value`
   */
  setSystemVariable (name, value) {
    return Promise.resolve()
      .then(() => {
        if (!_.includes(name, SYSTEM_VARIABLES)) {
          throw new TypeError(`"name" must be one of: ${SYSTEM_VARIABLES.join(
            ', ')}, but found "${name}"`);
        }
        if (!isUnsignedInteger(value)) {
          throw new TypeError(
            `"value" must be an unsigned integer <= ${MAX_INT}; got ${value}`);
        }
        return this.uart.setValue(name, value);
      });
  }

  /**
   * Sets the range of results returned by {@link System#random}.
   * @param {number} [min=0] - Unsigned integer; no greater than `max`
   * @param {number} [max=4294967295] - Unsigned integer; no less than `min`
   * @returns {Promise.<ResponseResult,TypeError>} Response or {@link
   *   TypeError} if invalid `min` or `max` value
   */
  setRandomRange (min = 0, max = 1) {
    return Promise.resolve()
      .then(() => {
        if (!isUnsignedInteger(min)) {
          throw new TypeError(
            `"min" must be an unsigned integer <= ${MAX_INT}`);
        }
        if (!isUnsignedInteger(max)) {
          throw new TypeError(
            `"max" must be an unsigned integer <= ${MAX_INT}`);
        }
        if (min > max) {
          throw new TypeError('"min" cannot be greater than "max"');
        }

        return this.uart.request(`ranset ${min},${max}`);
      });
  }

  /**
   * Gets a random value, optionally setting the allowed range via {@link System#setRandomRange}.
   * @param {number} [min=0] - Unsigned integer; no greater than `max`
   * @param {number} [max=0] - Unsigned integer; no less than `min`
   * @returns {Promise<ResponseResult,TypeError>} Result or error if invalid range supplied
   */
  random (min = 0, max = 0) {
    return Promise.resolve(() => {
      if (min || max) {
        return this.setRandomRange(min, max);
      }
    })
      .then(() => this.uart.request('rand'));
  }

  /**
   * Set sleep timer when not touched.
   * @param {number} ms - Sleep after `ms` milliseconds of no touching. Rounded to closest second.
   * @returns {Promise.<ResponseResult, Error>} Result
   */
  setNoTouchSleepTimer (ms = 0) {
    return this.uart.setValue('thsp', Math.floor(ms / 1000));
  }

  /**
   * Puts Nextion to sleep.
   * @see {@link System#wake}
   * @param {boolean} [shouldSleep=true] Sleep if `true`; wake if `false`.
   * @returns {Promise.<ResponseResult, Error>} Result
   */
  sleep (shouldSleep = true) {
    return this.uart.setValue('sleep', shouldSleep);
  }

  /**
   * Wakes Nextion from sleep.
   * @see {@link System#sleep}
   * @returns {Promise.<ResponseResult, Error>} Result
   */
  wake () {
    return this.sleep(false);
  }

  /**
   * Set display's brightness.
   * @param {number} [percent=100] - From 100 (full) to 0 (off)
   * @returns {Promise.<ResponseResult, Error>} - Response result
   */
  brightness (percent = 100) {
    debug(`Setting brightness to ${percent}`);
    return this.uart.setValue('dim', 100);
  }

  /**
   * Fades the display in.  Assuming current brightness is 0.
   * @param {number} [steps=50] - Number of steps...
   * @param {number} [duration=1000] - ...over this many ms...
   * @param {number} [limit=100] - ...up to this brightness level.
   * @returns {Promise<void,Error>} No response
   */
  fadeIn (steps = 25, duration = 1000, limit = 100) {
    let commands = [];
    const delay = Math.floor(duration / steps);
    const step = 1 / steps;
    const ceil = 1 / limit;
    for (let t = step; t <= ceil; t += step) {
      const v = Math.ceil(ease(t) * 100);
      commands.push(`dim=${v}`, `delay=${delay}`);
    }
    // avoid extra delay at end
    commands.pop();
    return pMapSeries(commands, command => this.uart.send(command));
  }

  /**
   * Fades the display out.  Assuming current brightness is 100.
   * @param {number} [steps=150] - Number of steps...
   * @param {number} [duration=3000] - ...over this many ms...
   * @param {number} [limit=0] - ...down to this brightness level.
   * @returns {Promise<void,Error>} No response
   */
  fadeOut (steps = 50, duration = 2000, limit = 0) {
    let commands = [];
    const delay = Math.floor(duration / steps);
    const step = 1 / steps;
    const floor = 1 / limit;
    for (let t = 1; t >= floor; t -= step) {
      const v = Math.floor(ease(t) * 100);
      commands.push(`dim=${v}`, `delay=${delay}`);
    }
    // avoid extra delay at end
    commands.pop();
    return pMapSeries(commands, command => this.uart.send(command));
  }
}
