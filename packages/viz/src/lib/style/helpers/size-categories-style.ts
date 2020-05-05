import {
  validateParameters,
  validateCategoryParameters,
  calculateSizeBins
} from './utils';
import {
  SizeCategoriesStyleOptions,
  defaultSizeCategoriesStyleOptions
} from './options';
import { CategoryFieldStats, Category, GeometryType } from '../../types';
import { Source } from '../../sources/Source';
import { applyDefaults } from '../default-styles';
import { Style } from '..';

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
  options: SizeCategoriesStyleOptions = defaultSizeCategoriesStyleOptions
) {
  validateParameters(featureProperty);

  validateCategoryParameters(
    featureProperty,
    options.categories,
    options.palette
  );

  const evalFN = (source: Source) => {
    const meta = source.getMetadata();
    let categories;

    if (options.categories.length) {
      categories = options.categories;
    } else {
      const stats = meta.stats.find(
        c => c.name === featureProperty
      ) as CategoryFieldStats;
      categories = stats.categories.map((c: Category) => c.category);
    }

    return calculateWithCategories(
      featureProperty,
      categories,
      meta.geometryType,
      options
    );
  };

  return new Style(evalFN, featureProperty);
}

function calculateWithCategories(
  featureProperty: string,
  categories: string[],
  geometryType: GeometryType,
  options: SizeCategoriesStyleOptions
) {
  const styles = applyDefaults(geometryType, options);

  const sizes = calculateSizeBins(categories.length, options.sizeRange);

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
      return options.nullSize;
    }

    const featureValueIndex = categories.indexOf(featureValue);
    return sizes[featureValueIndex];
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
  const minSize = Math.min(...sizes, options.nullSize);
  const maxSize = Math.max(...sizes, options.nullSize);

  return {
    ...styles,
    getRadius,
    getLineWidth,
    pointRadiusMinPixels: minSize,
    pointRadiusMaxPixels: maxSize,
    radiusUnits: 'pixels',
    lineWidthMinPixels: minSize,
    lineWidthMaxPixels: maxSize,
    lineWidthUnits: 'pixels',
    updateTriggers: { getRadius, getLineWidth }
  };
}
