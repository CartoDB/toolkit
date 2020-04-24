import { convertArrayToObjectWithValues } from '../../utils/object';
import {
  getColors,
  getUpdateTriggers,
  hexToRgb,
  validateParameters
} from './utils';

export function colorCategoriesStyle(
  featureProperty: string,
  {
    categories = defaultOptions.categories,
    colors = defaultOptions.colors,
    nullColor = defaultOptions.nullColor,
    othersColor = defaultOptions.othersColor
  }: ColorCategoriesStyleOptions = defaultOptions
) {
  validateCategoryParameters(featureProperty, categories, colors);

  const {
    rgbaColors,
    othersColor: rgbaOthersColor = hexToRgb(othersColor)
  } = getColors(colors, categories.length);

  const categoriesWithColors = convertArrayToObjectWithValues(
    categories,
    rgbaColors
  );
  const rgbaNullColor = hexToRgb(nullColor);

  const getFillColor = (feature: Record<string, any>) => {
    const category = feature.properties[featureProperty];

    if (!category) {
      return rgbaNullColor;
    }

    return categoriesWithColors[category] || rgbaOthersColor;
  };

  return {
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

interface ColorCategoriesStyleOptions {
  categories: string[];
  colors: string[] | string;
  nullColor: string;
  othersColor: string;
}

const defaultOptions = {
  categories: [],
  colors: 'purpor',
  nullColor: '#00000000',
  othersColor: '#00000000'
};
