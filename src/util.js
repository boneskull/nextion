import _ from 'lodash/fp';

export function hexStr (num) {
  return _.padCharsStart('0x0', 4, num.toString(16));
}
