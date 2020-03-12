import { convertArrayToObjectWithValues } from '../../utils/object';
import { getColors, validateParameters } from './utils';

export function colorCategoriesStyle(
  featureName: string,
  {
    categories = defaultOptions.categories,
    categoryColors = defaultOptions.categoryColors
  }: ColorCategoriesStyleOptions = defaultOptions
) {
  validateParameters(featureName, categories, categoryColors);

  const rgbaColors = getColors(categoryColors, categories.length);
  const categoriesWithColors = convertArrayToObjectWithValues(categories, rgbaColors);

  const getFillColor = (feature: Record<string, any>) => {
    // TODO: Add color for other categories
    const category = feature.properties[featureName];
    return categoriesWithColors[category];
  };

  return { getFillColor };
}

interface ColorCategoriesStyleOptions {
  categories: string[];
  categoryColors: string[] | string;
}

const defaultOptions = {
  categories: [],
  categoryColors: 'purpor'
};
