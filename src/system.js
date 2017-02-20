import _ from 'lodash/fp';
import {EventEmitter} from 'events';

const isUnsignedInteger = _.overEvery([
  _.isNumber,
  _.isFinite,
  _.gte(0)
]);

export const SYSTEM_GLOBAL_VARIABLES = [
  'sys0',
  'sys1',
  'sys2'
];

export class System extends EventEmitter {
  constructor (uart) {
    super();

    this.uart = uart;
  }

  async setGlobalVariable (name, value) {
    if (!_.includes(SYSTEM_GLOBAL_VARIABLES, name)) {
      throw new Error(
        `"name" must be one of: ${SYSTEM_GLOBAL_VARIABLES.join(', ')}`);
    }
    if (!isUnsignedInteger(value)) {
      throw new Error('"value" must be an unsigned integer <= 4294967295');
    }
    return await this.uart.setValue(name, value);
  }

  async setRandomRange (min, max) {
    if (!isUnsignedInteger(min)) {
      throw new Error('"min" must be an unsigned integer <= 4294967295');
    }
    if (!isUnsignedInteger(max)) {
      throw new Error('"max" must be an unsigned integer <= 4294967295');
    }

    return await this.uart.request(`ranset ${min},${max}`);
  }

  async random (min = 0, max = 0) {
    if (max < min) {
      throw new Error('"max" cannot be less than "min"');
    }
    if (min > 0 || max > 0) {
      await this.setRandomRange(min, max);
    }
    return await this.uart.request('rand');
  }

  async sleep () {
    return await this.uart.request('sleep=1');
  }

  async wake () {
    return await this.uart.request('sleep=0');
  }
}
