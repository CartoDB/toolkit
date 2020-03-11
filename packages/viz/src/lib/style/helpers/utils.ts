// TODO: Add GeoJSON type
import { CartoStylingError, stylingErrorTypes } from '../../errors/styling-error';

export function validateParameters(featureName: string, values: number[] | string[], colors: string[]) {
  if (!featureName) {
    throw new CartoStylingError('Feature name is missing', stylingErrorTypes.PROPERTY_MISSING);
  }

  const lengthMismatch = values.length !== colors.length;
  if (lengthMismatch) {
    throw new CartoStylingError(
      'Numeric values for ranges length and color length do not match',
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }
}
