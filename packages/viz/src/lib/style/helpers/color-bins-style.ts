import { getColors, validateParameters } from './utils';

export function colorBinsStyle(
  featureName: string,
  { bins = defaultOptions.bins, binColors = defaultOptions.binColors }: ColorBinStyleOptions = defaultOptions
) {
  validateParameters(featureName, bins, binColors);

  const ranges = [...bins, Number.MAX_SAFE_INTEGER];
  const rgbaColors = getColors(binColors, bins.length);

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

interface ColorBinStyleOptions {
  bins: number[];
  binColors: string[] | string;
}

const defaultOptions = {
  bins: [],
  binColors: 'purpor'
};
