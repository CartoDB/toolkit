// eslint-disable-next-line import/no-unresolved
import { sizeBinsStyle, defaultSizeBinsOptions } from '../src/lib/style';
import {
  CartoStylingError,
  stylingErrorTypes
} from '../src/lib/errors/styling-error';

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
      ).toThrowError(
        new CartoStylingError(
          'Numeric values for ranges length and color/size length do not match',
          stylingErrorTypes.PROPERTY_MISMATCH
        )
      );
    });
  });

  describe('getRadius and getLineWidth', () => {
    it('should return the radius and line width calculated with all parameters by default', () => {
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
    it('should return the radius and line width calculated by provided bins and range', () => {
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
    it('should return the radius and line width for each feature', () => {
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
    it('should return radius and line width 0 for features with null values for the attribute', () => {
      const sizeBinStyleInstance = sizeBinsStyle('attributeName', {
        bins: [0, 10, 15, 20],
        sizes: [5, 15, 30],
        othersSize: 60,
        nullSize: 0
      });

      expect(sizeBinStyleInstance.getRadius(recordExample)).toBe(15);
      expect(sizeBinStyleInstance.getRadius(recordOutOfRangeExample)).toBe(60);
      expect(sizeBinStyleInstance.getRadius(recordNullValueExample)).toBe(0);
      expect(sizeBinStyleInstance.getLineWidth(recordExample)).toBe(15);
      expect(sizeBinStyleInstance.getLineWidth(recordOutOfRangeExample)).toBe(
        60
      );
      expect(sizeBinStyleInstance.getLineWidth(recordNullValueExample)).toBe(0);
    });
  });

  describe('min/max values', () => {
    it('should get the min/max values from bins', () => {
      const sizeBinStyleInstance = sizeBinsStyle('attributeName', {
        bins: [0, 10, 15, 20],
        sizes: [5, 15, 30]
      });

      expect(sizeBinStyleInstance.pointRadiusMinPixels).toBe(
        Math.min(
          5,
          defaultSizeBinsOptions.othersSize,
          defaultSizeBinsOptions.nullSize
        )
      );
      expect(sizeBinStyleInstance.pointRadiusMaxPixels).toBe(
        Math.max(
          30,
          defaultSizeBinsOptions.othersSize,
          defaultSizeBinsOptions.nullSize
        )
      );
      expect(sizeBinStyleInstance.lineWidthMinPixels).toBe(
        Math.min(
          5,
          defaultSizeBinsOptions.othersSize,
          defaultSizeBinsOptions.nullSize
        )
      );
      expect(sizeBinStyleInstance.lineWidthMaxPixels).toBe(
        Math.max(
          30,
          defaultSizeBinsOptions.othersSize,
          defaultSizeBinsOptions.nullSize
        )
      );
    });
    it('should get the min/max values from all parameters', () => {
      const sizeBinStyleInstance = sizeBinsStyle('attributeName', {
        bins: [0, 10, 15, 20],
        sizes: [5, 15, 30],
        othersSize: 1,
        nullSize: 60
      });

      expect(sizeBinStyleInstance.pointRadiusMinPixels).toBe(1);
      expect(sizeBinStyleInstance.pointRadiusMaxPixels).toBe(60);
      expect(sizeBinStyleInstance.lineWidthMinPixels).toBe(1);
      expect(sizeBinStyleInstance.lineWidthMaxPixels).toBe(60);
    });
  });
});
