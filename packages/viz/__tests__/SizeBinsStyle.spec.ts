// eslint-disable-next-line import/no-unresolved
import { sizeBinsStyle } from '../src/lib/style';

describe('SizeBinsStyle', () => {
  describe('Style creation', () => {
    it('should create a sizeBinsStyle instance properly', () => {
      expect(() => sizeBinsStyle('attributeName')).not.toThrow();
    });
  });
});
