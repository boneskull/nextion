import * as util from '../../src/util';
import _ from 'lodash/fp';

describe('utility methods', function () {
  describe('toHex()', function () {
    it('should return a hexadecimal representation of a number', function () {
      expect(util.toHex(255), 'to be', '0xff');
    });

    it('should pad the hexadecimal representation', function () {
      expect(util.toHex(1), 'to be', '0x01');
    });
  });

  describe('isUnsignedInteger', function () {
    it('should return false for -1', function () {
      expect(util.isUnsignedInteger(-1), 'to be', false);
    });

    it('should return false for 1.5', function () {
      expect(util.isUnsignedInteger(1.5), 'to be', false);
    });

    it('should return true for 0', function () {
      expect(util.isUnsignedInteger(0), 'to be', true);
    });

    it('should return false for Infinity', function () {
      expect(util.isUnsignedInteger(Infinity), 'to be', false);
    });

    it('should return true for 1', function () {
      expect(util.isUnsignedInteger(1), 'to be', true);
    });

    it('should return true for 4294967295', function () {
      expect(util.isUnsignedInteger(4294967295), 'to be', true);
    });

    it('should return false for 4294967296', function () {
      expect(util.isUnsignedInteger(4294967296), 'to be', false);
    });

    it('should return false for a string', function () {
      expect(util.isUnsignedInteger('foo'), 'to be', false);
    });
  });
});
