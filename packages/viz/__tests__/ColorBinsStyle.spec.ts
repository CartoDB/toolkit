// eslint-disable-next-line import/no-unresolved
import { colorBinsStyle } from '../src/lib/style';

describe('ColorBinsStyle', () => {
  describe('Style creation', () => {
    it('should create a sizeBinsStyle instance properly', () => {
      expect(() => colorBinsStyle('attributeName')).not.toThrow();
    });
  });
});
