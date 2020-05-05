import { convertArrayToObjectWithValues } from '../../utils/object';
import {
  getColors,
  getUpdateTriggers,
  hexToRgb,
  validateCategoryParameters
} from './utils';
import { GeometryType, Category, CategoryFieldStats } from '../../types';
import { Style } from '../Style';
import { Source } from '../../sources/Source';
import { applyDefaults } from '../default-styles';
import {
  ColorCategoriesStyleOptions,
  defaultColorCategoriesStyleOptions
} from './options';

export function colorCategoriesStyle(
  featureProperty: string,
  options: ColorCategoriesStyleOptions = defaultColorCategoriesStyleOptions
) {
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
