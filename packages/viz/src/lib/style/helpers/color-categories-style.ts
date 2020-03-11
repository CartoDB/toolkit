import { hexToRgb } from '../../utils/colors';
import { convertArrayToObjectWithValues } from '../../utils/object';
import { validateParameters } from './utils';

export function colorCategoriesStyle(featureName: string, categories: string[] = [], colors: string[] = []) {
  validateParameters(featureName, categories, colors);

  const rgbaColors = colors.map(hexToRgb);
  const categoriesWithColors = convertArrayToObjectWithValues(categories, rgbaColors);

  const getFillColor = (feature: Record<string, any>) =>
    categoriesWithColors[feature.properties[featureName]];

  return { getFillColor };
}
