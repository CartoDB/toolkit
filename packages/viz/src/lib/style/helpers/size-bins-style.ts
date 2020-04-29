import { validateParameters } from './utils';

/**
 * @public
 * Creates an style based on a numeric field.
 *
 * @param featureProperty - Name of the attribute to symbolize by
 * @param options - Additional options
 * @returns The style based on the `featureProperty` attribute.
 */
export function sizeBinsStyle(
  featureProperty: string,
  options: SizeBinsStyleOptions = defaultSizeBinsOptions
) {
  const { bins, sizes, othersSize, nullSize } = extendDefaults(options);
  validateBinParameters(featureProperty, bins, sizes);

  // Number.MIN_SAFE_INTEGER is here to make closed intervals,
  // that way last range comparison will never be true
  const ranges = [...bins, Number.MIN_SAFE_INTEGER];

  /**
   * @private
   * Gets the size for the feature provided by parameter
   * according to the bins and sizes options.
   *
   * @param feature - feature used to calculate the size.
   * @returns size.
   */
  const getSizeValue = (feature: Record<string, any>) => {
    const featureValue: number = feature.properties[featureProperty];

    if (!featureValue) {
      return nullSize;
    }

    // If we want to add various comparisons (<, >, <=, <=) like in TurboCARTO
    // we can change comparison within the arrow function to a comparison fn
    const rangeComparison = (
      definedValue: number,
      currentIndex: number,
      valuesArray: number[]
    ) =>
      featureValue >= definedValue &&
      featureValue < valuesArray[currentIndex + 1];

    const featureValueIndex = ranges.findIndex(rangeComparison);
    return sizes[featureValueIndex] || othersSize;
  };

  /**
   * @public
   * Calculates the radius size for the feature provided
   * by parameter according to the bins and sizes.
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
   * by parameter according to the bins and sizes.
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
 * Checks if the bin parameters are valid.
 *
 * @param featureProperty
 * @param bins
 * @param sizes
 * @throws CartoStylingError if the parameters are invalid.
 */
function validateBinParameters(
  featureProperty: string,
  bins: number[],
  sizes: number[]
) {
  const comparison = () => bins.length - 1 !== sizes.length;
  validateParameters(featureProperty, comparison);
}

/**
 * @private
 * Add default values to empty options.
 *
 * @param options with default values.
 */
function extendDefaults(
  options: SizeBinsStyleOptions = defaultSizeBinsOptions
) {
  return {
    bins: options.bins || defaultSizeBinsOptions.bins,
    sizes: options.sizes || defaultSizeBinsOptions.sizes,
    othersSize: options.othersSize || defaultSizeBinsOptions.othersSize,
    nullSize: options.nullSize || defaultSizeBinsOptions.nullSize
  };
}

/**
 * SizeBinsStyle options for sizeBinsStyle
 */
interface SizeBinsStyleOptions {
  /**
   * The size classes.
   *
   */
  bins: number[];

  /**
   * array indicating the size relative
   * to each bin.
   *
   */
  sizes: number[];

  /**
   * Size applied to other features which
   * attribute is not included in bins.
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

export const defaultSizeBinsOptions = {
  bins: [],
  sizes: [],
  othersSize: 1,
  nullSize: 0
};
