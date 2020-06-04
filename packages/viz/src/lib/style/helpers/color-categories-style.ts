import { convertArrayToObjectWithValues } from '../../utils/object';
import { getColors, getUpdateTriggers, hexToRgb } from './utils';
import {
  CartoStylingError,
  stylingErrorTypes
} from '../../errors/styling-error';

import { StyledLayer } from '../layer-style';
import {
  CategoryFieldStats,
  Category,
  GeometryType
} from '../../sources/Source';
import { getStyleValue, getStyles, BasicOptionsStyle, Style } from '..';
import { colorValidation } from '../validators';

export const DEFAULT_PALETTE = 'bold';

export interface ColorCategoriesOptionsStyle
  extends Partial<BasicOptionsStyle> {
  // Number of categories. Default is 11. Values can range from 1 to 16.
  top: number;
  // Category list. Must be a valid list of categories.
  categories: string[];
  // Palette that can be a named cartocolor palette or other valid color palette.
  palette: string[] | string;
  // Color applied to features which the attribute value is null.
  nullColor: string;
  // Color applied to features which the attribute value is not in the breaks.
  othersColor: string;
}

function defaultOptions(
  geometryType: GeometryType,
  options: Partial<ColorCategoriesOptionsStyle>
): ColorCategoriesOptionsStyle {
  return {
    top: 11,
    categories: [],
    palette: DEFAULT_PALETTE,
    nullColor: getStyleValue('nullColor', geometryType, options),
    othersColor: getStyleValue('othersColor', geometryType, options),
    ...options
  };
}

export function colorCategoriesStyle(
  featureProperty: string,
  options: Partial<ColorCategoriesOptionsStyle> = {}
) {
  const evalFN = (layer: StyledLayer) => {
    const meta = layer.source.getMetadata();
    const opts = defaultOptions(meta.geometryType, options);

    validateParameters(opts);

    let categories;

    if (opts.categories.length) {
      categories = opts.categories;
    } else {
      const stats = meta.stats.find(
        c => c.name === featureProperty
      ) as CategoryFieldStats;

      if (!stats.categories || !stats.categories.length) {
        throw new CartoStylingError(
          `Current dataset has not categories for '${featureProperty}'`
        );
      }

      categories = stats.categories.map((c: Category) => c.category);
    }

    // Apply top
    categories = categories.slice(0, opts.top);

    return calculateWithCategories(
      featureProperty,
      categories,
      meta.geometryType,
      opts
    );
  };

  return new Style(evalFN, featureProperty);
}

function calculateWithCategories(
  featureProperty: string,
  categories: string[],
  geometryType: GeometryType,
  options: ColorCategoriesOptionsStyle
) {
  const styles = getStyles(geometryType, options);

  const colors = getColors(options.palette, categories.length).map(hexToRgb);
  const categoriesWithColors = convertArrayToObjectWithValues(
    categories,
    colors
  );
  const rgbaNullColor = hexToRgb(options.nullColor);
  const rgbaOthersColor = hexToRgb(options.othersColor);

  const getFillColor = (
    feature: Record<string, Record<string, number | string>>
  ) => {
    const category = feature.properties[featureProperty];

    if (!category) {
      return rgbaNullColor;
    }

    return categoriesWithColors[category] || rgbaOthersColor;
  };

  let geomStyles;

  if (geometryType === 'Line') {
    geomStyles = {
      getLineColor: getFillColor,
      updateTriggers: getUpdateTriggers({
        getLineColor: getFillColor
      })
    };
  } else {
    geomStyles = {
      getFillColor,
      updateTriggers: getUpdateTriggers({
        getFillColor
      })
    };
  }

  return {
    ...styles,
    ...geomStyles
  };
}

function validateParameters(options: ColorCategoriesOptionsStyle) {
  const explicitCategories = options.categories.length > 0;
  const explicitColorsList = typeof options.palette !== 'string';

  if (explicitCategories && explicitColorsList) {
    if (options.categories.length !== options.palette.length) {
      throw new CartoStylingError(
        'Manual categories provided and the length of categories and palette mismatch',
        stylingErrorTypes.PROPERTY_MISMATCH
      );
    }
  }

  if (
    options.categories.length > 0 &&
    Array.isArray(options.palette) &&
    options.categories.length !== options.palette.length
  ) {
    throw new CartoStylingError(
      'Manual categories provided and the length of categories and palette mismatch',
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }

  if (options.top < 1 || options.top > 12) {
    throw new CartoStylingError(
      'Manual top provided should be a number between 1 and 12',
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }

  if (options.nullColor && !colorValidation(options.nullColor)) {
    throw new CartoStylingError(
      `nullColor '${options.color}' is not valid`,
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }

  if (options.othersColor && !colorValidation(options.othersColor)) {
    throw new CartoStylingError(
      `othersColor '${options.color}' is not valid`,
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }
}
