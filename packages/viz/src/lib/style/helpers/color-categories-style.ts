import { convertArrayToObjectWithValues } from '../../utils/object';
import {
  getColors,
  getUpdateTriggers,
  hexToRgb,
  validateParameters
} from './utils';
import { GeometryType, Category, CategoryFieldStats } from '../../types';
import { Style } from '../Style';
import { Source } from '../../sources/Source';
import { applyDefaults, DefaultOptions } from '../default-styles';

export function colorCategoriesStyle(
  featureProperty: string,
  options?: ColorCategoriesStyleOptions
) {
  const opts = { ...defaultOptions, ...options };

  validateCategoryParameters(featureProperty, opts.categories, opts.palette);

  const evalFN = (source: Source) => {
    const meta = source.getMetadata();
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
  const styles = applyDefaults(geometryType, options);

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

function validateCategoryParameters(
  featureProperty: string,
  values: number[] | string[],
  colors: string[] | string
) {
  const comparison = () => values.length !== colors.length;
  return validateParameters(featureProperty, colors, comparison);
}

interface ColorCategoriesStyleOptions extends DefaultOptions {
  categories: string[];
  palette: string[] | string;
  nullColor: string;
  othersColor: string;
}

const defaultOptions: ColorCategoriesStyleOptions = {
  categories: [],
  palette: 'purpor',
  nullColor: '#00000000',
  othersColor: '#00000000'
};
