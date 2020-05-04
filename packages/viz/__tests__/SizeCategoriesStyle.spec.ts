// eslint-disable-next-line import/no-unresolved
import {
  sizeCategoriesStyle,
  defaultSizeCategoriesOptions
} from '../src/lib/style';
import {
  CartoStylingError,
  stylingErrorTypes
} from '../src/lib/errors/styling-error';

describe('SizeCategoriesStyle', () => {
  const [CATEGORY_1, CATEGORY_2, CATEGORY_3] = [
    'category_1',
    'category_2',
    'category_3'
  ];
  const recordExample: Record<string, any> = {
    properties: {
      attributeName: CATEGORY_2,
      otherAttribute: 'foo'
    }
  };
  const recordOutOfRangeExample: Record<string, any> = {
    properties: {
      attributeName: 'category_100',
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
    it('should create a sizeCategoriesStyle instance properly', () => {
      expect(() =>
        sizeCategoriesStyle('attributeName', {
          categories: [CATEGORY_1, CATEGORY_2],
          sizes: [2, 10]
        })
      ).not.toThrow();
    });
    it('should fail when creating a sizeCategoriesStyle instance with invalid parameters', () => {
      expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        () => sizeCategoriesStyle('attributeName', { categories: 5 })
      ).toThrow();
    });
    it('should fail when creating a sizeCategoriesStyle instance with invalid parameters II', () => {
      expect(() =>
        sizeCategoriesStyle('attributeName', {
          categories: [CATEGORY_1, CATEGORY_2],
          sizes: [2, 10, 15]
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
    it('should return the radius and line width calculated by provided categories and sizes', () => {
      const sizeCategoriesStyleInstance = sizeCategoriesStyle('attributeName', {
        categories: [CATEGORY_1, CATEGORY_2, CATEGORY_3],
        sizes: [5, 15, 30]
      });

      expect(sizeCategoriesStyleInstance.getRadius(recordExample)).toBe(15);
      expect(
        sizeCategoriesStyleInstance.getRadius(recordOutOfRangeExample)
      ).toBe(defaultSizeCategoriesOptions.othersSize);
      expect(
        sizeCategoriesStyleInstance.getRadius(recordNullValueExample)
      ).toBe(defaultSizeCategoriesOptions.nullSize);
      expect(sizeCategoriesStyleInstance.getLineWidth(recordExample)).toBe(15);
      expect(
        sizeCategoriesStyleInstance.getLineWidth(recordOutOfRangeExample)
      ).toBe(defaultSizeCategoriesOptions.othersSize);
      expect(
        sizeCategoriesStyleInstance.getLineWidth(recordNullValueExample)
      ).toBe(defaultSizeCategoriesOptions.nullSize);
    });
    it('should return the radius and line width for each feature', () => {
      const sizeCategoriesStyleInstance = sizeCategoriesStyle('attributeName', {
        categories: [CATEGORY_1, CATEGORY_2, CATEGORY_3],
        sizes: [5, 15, 30],
        othersSize: 60,
        nullSize: 100
      });

      expect(sizeCategoriesStyleInstance.getRadius(recordExample)).toBe(15);
      expect(
        sizeCategoriesStyleInstance.getRadius(recordOutOfRangeExample)
      ).toBe(60);
      expect(
        sizeCategoriesStyleInstance.getRadius(recordNullValueExample)
      ).toBe(100);
      expect(sizeCategoriesStyleInstance.getLineWidth(recordExample)).toBe(15);
      expect(
        sizeCategoriesStyleInstance.getLineWidth(recordOutOfRangeExample)
      ).toBe(60);
      expect(
        sizeCategoriesStyleInstance.getLineWidth(recordNullValueExample)
      ).toBe(100);
    });
    it('should return radius and line width 0 for features with null values for the attribute', () => {
      const sizeCategoriesStyleInstance = sizeCategoriesStyle('attributeName', {
        categories: [CATEGORY_1, CATEGORY_2, CATEGORY_3],
        sizes: [5, 15, 30],
        othersSize: 60,
        nullSize: 0
      });

      expect(sizeCategoriesStyleInstance.getRadius(recordExample)).toBe(15);
      expect(
        sizeCategoriesStyleInstance.getRadius(recordOutOfRangeExample)
      ).toBe(60);
      expect(
        sizeCategoriesStyleInstance.getRadius(recordNullValueExample)
      ).toBe(0);
      expect(sizeCategoriesStyleInstance.getLineWidth(recordExample)).toBe(15);
      expect(
        sizeCategoriesStyleInstance.getLineWidth(recordOutOfRangeExample)
      ).toBe(60);
      expect(
        sizeCategoriesStyleInstance.getLineWidth(recordNullValueExample)
      ).toBe(0);
    });
  });

  describe('min/max values', () => {
    it('should get the min/max values from categories', () => {
      const sizeCategoriesStyleInstance = sizeCategoriesStyle('attributeName', {
        categories: [CATEGORY_1, CATEGORY_2, CATEGORY_3],
        sizes: [5, 15, 30]
      });

      expect(sizeCategoriesStyleInstance.pointRadiusMinPixels).toBe(
        Math.min(
          5,
          defaultSizeCategoriesOptions.othersSize,
          defaultSizeCategoriesOptions.nullSize
        )
      );
      expect(sizeCategoriesStyleInstance.pointRadiusMaxPixels).toBe(
        Math.max(
          30,
          defaultSizeCategoriesOptions.othersSize,
          defaultSizeCategoriesOptions.nullSize
        )
      );
      expect(sizeCategoriesStyleInstance.lineWidthMinPixels).toBe(
        Math.min(
          5,
          defaultSizeCategoriesOptions.othersSize,
          defaultSizeCategoriesOptions.nullSize
        )
      );
      expect(sizeCategoriesStyleInstance.lineWidthMaxPixels).toBe(
        Math.max(
          30,
          defaultSizeCategoriesOptions.othersSize,
          defaultSizeCategoriesOptions.nullSize
        )
      );
    });
    it('should get the min/max values from all parameters', () => {
      const sizeCategoriesStyleInstance = sizeCategoriesStyle('attributeName', {
        categories: [CATEGORY_1, CATEGORY_2, CATEGORY_3],
        sizes: [5, 15, 30],
        othersSize: 1,
        nullSize: 60
      });

      expect(sizeCategoriesStyleInstance.pointRadiusMinPixels).toBe(1);
      expect(sizeCategoriesStyleInstance.pointRadiusMaxPixels).toBe(60);
      expect(sizeCategoriesStyleInstance.lineWidthMinPixels).toBe(1);
      expect(sizeCategoriesStyleInstance.lineWidthMaxPixels).toBe(60);
    });
  });
});
