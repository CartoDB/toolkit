// eslint-disable-next-line import/no-unresolved
import { sizeBinsStyle, defaultSizeBinsOptions } from '../src/lib/style';

describe('SizeBinsStyle', () => {
  const recordExample: Record<string, any> = {
    properties: {
      attributeName: 12,
      otherAttribute: 'foo'
    }
  };
  const recordOutOfRangeExample: Record<string, any> = {
    properties: {
      attributeName: 100,
      otherAttribute: 'foo'
    }
  };
  const recordNullValueExample: Record<string, any> = {
    properties: {
      attributeName: null,
      otherAttribute: 'foo'
    }
  };
  describe('Style creation', () => {
    it('should create a sizeBinsStyle instance properly', () => {
      expect(() =>
        sizeBinsStyle('attributeName', {
          bins: [0, 10, 15],
          sizes: [2, 10]
        })
      ).not.toThrow();
    });
    it('should fail when creating sizeBinsStyle instance with no bins nor sizes', () => {
      expect(() => sizeBinsStyle('attributeName')).toThrow();
    });
    it('should fail when creating a sizeBinsStyle instance with invalid parameters', () => {
      expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        () => sizeBinsStyle('attributeName', { bins: 'invalid' })
      ).toThrow();
    });
    it('should fail when creating a sizeBinsStyle instance with invalid parameters II', () => {
      expect(() =>
        sizeBinsStyle('attributeName', {
          bins: [0, 10],
          sizes: [2, 10, 15, 50]
        })
      ).toThrow();
    });
  });

  describe('getRadius and getLineWidth', () => {
    it('should returns the radius and line width calculated with all parameters by default', () => {
      const sizeBinStyleInstance = sizeBinsStyle('attributeName', {
        bins: [0, 10, 15, 20],
        sizes: [5, 15, 30]
      });

      expect(sizeBinStyleInstance.getRadius(recordExample)).toBe(15);
      expect(sizeBinStyleInstance.getRadius(recordOutOfRangeExample)).toBe(
        defaultSizeBinsOptions.othersSize
      );
      expect(sizeBinStyleInstance.getRadius(recordNullValueExample)).toBe(
        defaultSizeBinsOptions.nullSize
      );
      expect(sizeBinStyleInstance.getLineWidth(recordExample)).toBe(15);
      expect(sizeBinStyleInstance.getLineWidth(recordOutOfRangeExample)).toBe(
        defaultSizeBinsOptions.othersSize
      );
      expect(sizeBinStyleInstance.getLineWidth(recordNullValueExample)).toBe(
        defaultSizeBinsOptions.nullSize
      );
    });
    it('should returns the radius and line width calculated by provided bins and range', () => {
      const sizeBinStyleInstance = sizeBinsStyle('attributeName', {
        bins: [0, 10, 15, 20],
        sizes: [5, 15, 30]
      });

      expect(sizeBinStyleInstance.getRadius(recordExample)).toBe(15);
      expect(sizeBinStyleInstance.getRadius(recordOutOfRangeExample)).toBe(
        defaultSizeBinsOptions.othersSize
      );
      expect(sizeBinStyleInstance.getRadius(recordNullValueExample)).toBe(
        defaultSizeBinsOptions.nullSize
      );
      expect(sizeBinStyleInstance.getLineWidth(recordExample)).toBe(15);
      expect(sizeBinStyleInstance.getLineWidth(recordOutOfRangeExample)).toBe(
        defaultSizeBinsOptions.othersSize
      );
      expect(sizeBinStyleInstance.getLineWidth(recordNullValueExample)).toBe(
        defaultSizeBinsOptions.nullSize
      );
    });
    it('should returns the radius and line width for each feature', () => {
      const sizeBinStyleInstance = sizeBinsStyle('attributeName', {
        bins: [0, 10, 15, 20],
        sizes: [5, 15, 30],
        othersSize: 60,
        nullSize: 100
      });

      expect(sizeBinStyleInstance.getRadius(recordExample)).toBe(15);
      expect(sizeBinStyleInstance.getRadius(recordOutOfRangeExample)).toBe(60);
      expect(sizeBinStyleInstance.getRadius(recordNullValueExample)).toBe(100);
      expect(sizeBinStyleInstance.getLineWidth(recordExample)).toBe(15);
      expect(sizeBinStyleInstance.getLineWidth(recordOutOfRangeExample)).toBe(
        60
      );
      expect(sizeBinStyleInstance.getLineWidth(recordNullValueExample)).toBe(
        100
      );
    });
  });
});
