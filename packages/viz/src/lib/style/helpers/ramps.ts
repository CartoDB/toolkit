import {CartoStylingError, stylingErrorTypes} from '../../errors/styling-error';

export function numericRamp(featureName: string, numericValues = [], colors = []) {
  if (!featureName) {
    throw new CartoStylingError('Feature name is missing', stylingErrorTypes.PROPERTY_MISSING);
  }

  const lengthMismatch = numericValues.length !== colors.length;
  if (lengthMismatch) {
    throw new CartoStylingError(
      'Numeric values for ranges length and color length do not match',
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }

  const ranges = [
    ...numericValues,
    Number.MAX_SAFE_INTEGER
  ];

  const getFillColor = (feature: Record<string, any>) => {
    const featureValue: number = feature.properties[featureName];

    // If we want to add various comparisons (<, >, <=, <=) like in TurboCARTO
    // we can change comparison within the arrow function to a comparison fn
    const valueComparison = (definedValue: number, currentIndex: number, valuesArray: number[]) =>
      (featureValue >= definedValue) && (featureValue < valuesArray[currentIndex + 1]);

    const featureValueIndex = ranges.findIndex(valueComparison);
    return colors[featureValueIndex];
  };

  return { getFillColor };
}
