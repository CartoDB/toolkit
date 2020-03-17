import { convertArrayToObjectWithValues } from '../../utils/object';
import { getColors, hexToRgb, validateParameters } from './utils';

export function colorCategoriesStyle(
  featureName: string,
  {
    categories = defaultOptions.categories,
    categoryColors = defaultOptions.categoryColors,
    nullColor = defaultOptions.nullColor,
    othersColor = defaultOptions.othersColor
  }: ColorCategoriesStyleOptions = defaultOptions
) {
  validateParameters(featureName, categories, categoryColors);

  const {
    rgbaColors,
    othersColor: rgbaOthersColor = hexToRgb(othersColor)
  } = getColors(categoryColors, categories.length);

  const categoriesWithColors = convertArrayToObjectWithValues(categories, rgbaColors);
  const rgbaNullColor = hexToRgb(nullColor);

  const getFillColor = (feature: Record<string, any>) => {
    const category = feature.properties[featureName];

    if (!category) {
      return rgbaNullColor;
    }

    return categoriesWithColors[category] || rgbaOthersColor;
  };

  return { getFillColor };
}

interface ColorCategoriesStyleOptions {
  categories: string[];
  categoryColors: string[] | string;
  nullColor: string;
  othersColor: string;
}

const defaultOptions = {
  categories: [],
  categoryColors: 'purpor',
  nullColor: '#00000000',
  othersColor: '#00000000'
};
