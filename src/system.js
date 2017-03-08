import _ from 'lodash/fp';
import {EventEmitter} from 'events';

const isUnsignedInteger = _.overEvery([
  _.isNumber,
  _.isFinite,
  _.gte(0)
]);

export const SYSTEM_VARIABLES = [
  'sys0',
  'sys1',
  'sys2'
];

export class System extends EventEmitter {
  constructor (uart) {
    super();

    this.uart = uart;
  }

  setSystemVariable (name, value) {
    return Promise.resolve()
      .then(() => {
        if (!_.includes(SYSTEM_VARIABLES, name)) {
          throw new Error(
            `"name" must be one of: ${SYSTEM_VARIABLES.join(', ')}`);
        }
        if (!isUnsignedInteger(value)) {
          throw new Error('"value" must be an unsigned integer <= 4294967295');
        }
        return this.uart.setValue(name, value);
      });
  }

  setRandomRange (min, max) {
    return Promise.resolve()
      .then(() => {
        if (!isUnsignedInteger(min)) {
          throw new Error('"min" must be an unsigned integer <= 4294967295');
        }
        if (!isUnsignedInteger(max)) {
          throw new Error('"max" must be an unsigned integer <= 4294967295');
        }

        return this.uart.request(`ranset ${min},${max}`);
      });
  }

  random (min = 0, max = 0) {
    return Promise.resolve(() => {
      if (max < min) {
        throw new Error('"max" cannot be less than "min"');
      }
      if (min < 0 || max < 0) {
        throw new Error('only positive integers allowed');
      }
      if (min > 0 || max > 0) {
        return this.setRandomRange(min, max);
      }
    })
      .then(() => this.uart.request('rand'));
  }

  sleep () {
    return this.uart.setValue('sleep', true);
  }

  wake () {
    return this.uart.setValue('sleep', false);
  }
}
