import {
  sizeCategoriesStyle,
  defaultSizeCategoriesStyleOptions
} from '../src/lib/style';

describe('SizeCategoriesStyle', () => {
  describe('Style creation', () => {
    it('should create a sizeCategoriesStyle instance properly', () => {
      expect(() =>
        sizeCategoriesStyle('attributeName', defaultSizeCategoriesStyleOptions)
      ).not.toThrow();
    });
  });
});
