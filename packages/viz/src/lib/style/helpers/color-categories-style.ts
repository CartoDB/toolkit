import { convertArrayToObjectWithValues } from '../../utils/object';
import { getColors, getUpdateTriggers, hexToRgb } from './utils';
import {
  GeometryType,
  Category,
  CategoryFieldStats
} from '../../global-interfaces';
import { Style } from '../Style';
import {
  CartoStylingError,
  stylingErrorTypes
} from '../../errors/styling-error';
import {
  ColorCategoriesStyleOptions,
  defaultColorCategoriesStyleOptions
} from '..';
import { StyledLayer } from '../layer-style';
import { toDeckStyles } from './style-transform';

export function colorCategoriesStyle(
  featureProperty: string,
  options?: ColorCategoriesStyleOptions
) {
  const opts = { ...defaultColorCategoriesStyleOptions, ...options };

  validateParameters(opts);

  const evalFN = (layer: StyledLayer) => {
    const meta = layer.source.getMetadata();
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
  options: ColorCategoriesStyleOptions
) {
  const styles = toDeckStyles(geometryType, options);

  const {
    rgbaColors,
    othersColor: rgbaOthersColor = hexToRgb(options.othersColor)
  } = getColors(options.palette, categories.length);

  const categoriesWithColors = convertArrayToObjectWithValues(
    categories,
    rgbaColors
  );
  const rgbaNullColor = hexToRgb(options.nullColor);

  const getFillColor = (
    feature: Record<string, Record<string, number | string>>
  ) => {
    const category = feature.properties[featureProperty];

    if (!category) {
      return rgbaNullColor;
    }

    return categoriesWithColors[category] || rgbaOthersColor;
  };

  return {
    ...styles,
    getFillColor,
    updateTriggers: getUpdateTriggers({ getFillColor })
  };
}

function validateParameters(options: ColorCategoriesStyleOptions) {
  if (
    options.categories.length > 0 &&
    options.categories.length !== options.palette.length
  ) {
    throw new CartoStylingError(
      'Manual categories provided and the length of categories and palette mismatch',
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }
}
