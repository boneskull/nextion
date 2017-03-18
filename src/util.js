import _ from 'lodash/fp';

/**
 * Largest unsigned integer Nextion can handle (I think)
 * @type {number}
 * @private
 */
export const MAX_INT = 4294967295;

/**
 * Converts decimal to a string hexadecimal representation beginning with `0x`.
 * @param {number} num - Number to convert
 * @type {Function}
 * @private
 * @returns {string} Hexadecimal representation of number
 */
export const toHex = _.pipe(num => num.toString(16), _.padCharsStart('0x0', 4));

/**
 * Returns `true` if `value` quacks like a {@link Serialport} object.
 * @type {Function}
 * @param {*} value - Value to test
 * @private
 * @returns {boolean} Result
 */
export const isValidPort = _.allPass([
  _.isObject,
  _.pipe(_.property('on'), _.isFunction),
  _.pipe(_.property('write'), _.isFunction),
  _.pipe(_.property('drain'), _.isFunction)
]);

/**
 * Returns `true` if unsigned integer and <= 4294967295.
 * @param {*} value - Value to test
 * @private
 * @returns {boolean} Result
 */
export const isUnsignedInteger = _.allPass([
  _.isNumber,
  _.isFinite,
  _.isInteger,
  _.gte(_, 0),
  _.lte(_, MAX_INT)
]);
