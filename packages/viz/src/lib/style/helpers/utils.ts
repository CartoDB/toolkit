import {
  CartoStylingError,
  stylingErrorTypes
} from '../../errors/styling-error';
import { getColorPalette } from '../palettes';

export function validateParameters(
  featureProperty: string,
  colors: string[] | string,
  lengthComparisonFn: () => {}
) {
  if (!featureProperty) {
    throw new CartoStylingError(
      'Feature property is missing',
      stylingErrorTypes.PROPERTY_MISSING
    );
  }

  const lengthMismatch = lengthComparisonFn();
  const colorsIsNotString = typeof colors !== 'string';

  if (colorsIsNotString && lengthMismatch) {
    throw new CartoStylingError(
      'Numeric values for ranges length and color length do not match',
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }
}

export function getUpdateTriggers(accessorFunction: Record<string, unknown>) {
  return {
    getFillColor: [accessorFunction.getFillColor]
  };
}

export function getColors(
  colorProperty: string | string[],
  colorLength: number
) {
  if (typeof colorProperty === 'string') {
    const { colors: rgbaColors, othersColor } = getColorPalette(
      colorProperty.toUpperCase(),
      colorLength
    );

    return {
      rgbaColors: rgbaColors.map(hexToRgb),
      othersColor: othersColor ? hexToRgb(othersColor) : undefined
    };
  }

  return { rgbaColors: (colorProperty as string[]).map(hexToRgb) };
}

// Extracted from https://github.com/CartoDB/carto-vl/blob/develop/src/renderer/viz/expressions/utils.js#L53
export function hexToRgb(hex: string) {
  // Evaluate #ABC
  let result = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(hex);

  if (result) {
    return [
      parseInt(result[1] + result[1], 16),
      parseInt(result[2] + result[2], 16),
      parseInt(result[3] + result[3], 16),
      255
    ];
  }

  // Evaluate #ABCD
  result = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(hex);

  if (result) {
    return [
      parseInt(result[1] + result[1], 16),
      parseInt(result[2] + result[2], 16),
      parseInt(result[3] + result[3], 16),
      parseInt(result[4] + result[4], 16)
    ];
  }

  // Evaluate #ABCDEF
  result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (result) {
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
      255
    ];
  }

  // Evaluate #ABCDEFAF
  result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (result) {
    return [
      parseInt(result[1], 16),
      parseInt(result[4], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ];
  }

  throw new Error();
}
