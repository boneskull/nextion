import * as util from '../../src/util';

describe('utility methods', function () {
  describe('toHex()', function () {
    it('should return a hexadecimal representation of a number', function () {
      expect(util.toHex(255), 'to be', '0xff');
    });

    it('should pad the hexadecimal representation', function () {
      expect(util.toHex(1), 'to be', '0x01');
    });
  });
});
