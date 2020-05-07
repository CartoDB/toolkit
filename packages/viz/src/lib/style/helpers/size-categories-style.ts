import { calculateSizeBins } from './utils';

import {
  Style,
  SizeCategoriesStyleOptions,
  defaultSizeCategoriesStyleOptions
} from '..';
import {
  CartoStylingError,
  stylingErrorTypes
} from '../../errors/styling-error';
import { StyledLayer, pixel2meters } from '../layer-style';
import {
  CategoryFieldStats,
  Category,
  GeometryType
} from '../../global-interfaces';
import { toDeckStyles } from './style-transform';

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
  options?: SizeCategoriesStyleOptions
) {
  const opts = { ...defaultSizeCategoriesStyleOptions, ...options };

  const evalFN = (layer: StyledLayer) => {
    const meta = layer.source.getMetadata();

    if (meta.geometryType === 'Polygon') {
      throw new CartoStylingError(
        "Polygon layer doesn't support sizeCategoriesStyle",
        stylingErrorTypes.GEOMETRY_TYPE_UNSUPPORTED
      );
    }

    let categories;

    if (opts.categories.length) {
      categories = opts.categories;
    } else {
      const stats = meta.stats.find(
        c => c.name === featureProperty
      ) as CategoryFieldStats;
      categories = stats.categories.map((c: Category) => c.category);
    }

    return calculateWithCategories(
      featureProperty,
      layer,
      categories,
      meta.geometryType,
      opts
    );
  };

  return new Style(evalFN, featureProperty);
}

function calculateWithCategories(
  featureProperty: string,
  layer: StyledLayer,
  categories: string[],
  geometryType: GeometryType,
  options: SizeCategoriesStyleOptions
) {
  const styles = toDeckStyles(geometryType, options);

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
    return pixel2meters(sizes[featureValueIndex], layer);
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
  let obj;

  if (geometryType === 'Point') {
    obj = {
      getRadius,
      pointRadiusMinPixels: minSize,
      pointRadiusMaxPixels: maxSize,
      radiusUnits: 'pixels'
    };
  } else {
    obj = {
      getLineWidth,
      lineWidthMinPixels: minSize,
      lineWidthMaxPixels: maxSize,
      radiusUnits: 'pixels'
    };
  }

  return {
    ...styles,
    ...obj,
    updateTriggers: { getRadius, getLineWidth }
  };
}
