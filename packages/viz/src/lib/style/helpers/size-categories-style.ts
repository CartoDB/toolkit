import { validateParameters } from './utils';

/**
 * @public
 * Creates an style based on a string field with a category.
 *
 * @param featureProperty - Name of the attribute to symbolize by
 * @param options - Additional options
 * @returns The style based on the `featureProperty` attribute.
 */
export function sizeCategoriesStyle(
  featureProperty: string,
  options: SizeCategoriesStyleOptions = defaultSizeCategoriesOptions
) {
  const { categories, sizes, othersSize, nullSize } = extendDefaults(options);
  validateBinParameters(featureProperty, categories, sizes);

  /**
   * @private
   * Gets the size for the feature provided by parameter
   * according to the categories and sizes options.
   *
   * @param feature - feature used to calculate the size.
   * @returns size.
   */
  const getSizeValue = (feature: Record<string, any>) => {
    const featureValue: string = feature.properties[featureProperty];

    if (!featureValue) {
      return nullSize;
    }

    const featureValueIndex = categories.indexOf(featureValue);
    return sizes[featureValueIndex] || othersSize;
  };

  /**
   * @public
   * Calculates the radius size for the feature provided
   * by parameter according to the categories and sizes.
   *
   * @param feature - feature used to calculate the radius size.
   * @returns radio size.
   */
  const getRadius = (feature: Record<string, any>) => {
    return getSizeValue(feature);
  };

  /**
   * @public
   * Calculates the line width for the feature provided
   * by parameter according to the categories and sizes.
   *
   * @param feature - feature used to calculate the line width.
   * @returns radio size.
   */
  const getLineWidth = (feature: Record<string, any>) => {
    return getSizeValue(feature);
  };

  // gets the min and max size
  const minSize = Math.min(...sizes, othersSize, nullSize);
  const maxSize = Math.max(...sizes, othersSize, nullSize);

  return {
    getRadius,
    getLineWidth,
    pointRadiusMinPixels: minSize,
    pointRadiusMaxPixels: maxSize,
    lineWidthMinPixels: minSize,
    lineWidthMaxPixels: maxSize,
    lineWidthUnits: 'pixels',
    updateTriggers: { getRadius, getLineWidth }
  };
}

/**
 * @private
 * Checks if the categories parameters are valid.
 *
 * @param featureProperty
 * @param bins
 * @param sizes
 * @throws CartoStylingError if the parameters are invalid.
 */
function validateBinParameters(
  featureProperty: string,
  categories: string[],
  sizes: number[]
) {
  const comparison = () => categories.length !== sizes.length;
  validateParameters(featureProperty, comparison);
}

/**
 * @private
 * Add default values to empty options.
 *
 * @param options with default values.
 */
function extendDefaults(
  options: SizeCategoriesStyleOptions = defaultSizeCategoriesOptions
) {
  return {
    categories: options.categories || defaultSizeCategoriesOptions.categories,
    sizes: options.sizes || defaultSizeCategoriesOptions.sizes,
    othersSize: options.othersSize || defaultSizeCategoriesOptions.othersSize,
    nullSize: options.nullSize || defaultSizeCategoriesOptions.nullSize
  };
}

/**
 * SizeCategoriesStyle options for sizeCategoriesStyle
 */
interface SizeCategoriesStyleOptions {
  /**
   * The categories.
   *
   */
  categories: string[];

  /**
   * array indicating the size relative
   * to each bin.
   *
   */
  sizes: number[];

  /**
   * Size applied to other features which
   * attribute is not included in the categories.
   *
   * @defaultValue 1
   */
  othersSize?: number;

  /**
   * Size applied to features which the
   * attribute value is null.
   *
   * @defaultValue 0
   */
  nullSize?: number;
}

export const defaultSizeCategoriesOptions = {
  categories: [],
  sizes: [],
  othersSize: 1,
  nullSize: 0
};
