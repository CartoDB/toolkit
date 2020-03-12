import { CartoStylingError, stylingErrorTypes } from '../../errors/styling-error';
import { hexToRgb } from '../../utils/colors';
import { getColorPalette } from '../palettes';

export function validateParameters(featureName: string, values: number[] | string[], colors: string[] | string) {
  if (!featureName) {
    throw new CartoStylingError('Feature name is missing', stylingErrorTypes.PROPERTY_MISSING);
  }

  const lengthMismatch = values.length !== colors.length;
  const colorsIsNotString = typeof colors !== 'string';

  if (colorsIsNotString && lengthMismatch) {
    throw new CartoStylingError(
      'Numeric values for ranges length and color length do not match',
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }
}

export function getColors(colorProperty: string | string[] | number[], colorLength: number) {
  let colors = colorProperty;

  if (typeof colorProperty === 'string') {
    colors = getColorPalette(colorProperty.toUpperCase(), colorLength);
  }

  return (colors as string[]).map(hexToRgb);
}
