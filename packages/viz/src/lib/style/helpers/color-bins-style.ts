import { hexToRgb } from '../../utils/colors';
import { validateParameters } from './utils';

export function colorBinsStyle(featureName: string, binRanges: number[] = [], colors: string[] = []) {
  validateParameters(featureName, binRanges, colors);

  const ranges = [...binRanges, Number.MAX_SAFE_INTEGER];
  const rgbaColors = colors.map(hexToRgb);

  const getFillColor = (feature: Record<string, any>) => {
    const featureValue: number = feature.properties[featureName];

    // If we want to add various comparisons (<, >, <=, <=) like in TurboCARTO
    // we can change comparison within the arrow function to a comparison fn
    const rangeComparison = (definedValue: number, currentIndex: number, valuesArray: number[]) =>
      (featureValue >= definedValue) && (featureValue < valuesArray[currentIndex + 1]);

    const featureValueIndex = ranges.findIndex(rangeComparison);
    return rgbaColors[featureValueIndex];
  };

  return { getFillColor };
}
