import { RGBAColor } from '@deck.gl/aggregation-layers/utils/color-utils';
import {
  CartoStylingError,
  stylingErrorTypes
} from '../../errors/styling-error';
import { getColorPalette } from '../palettes';
import { GeometryType } from '../../types';
import { Classifier } from '../Classifier';

export function validateColorParameters(
  featureProperty: string,
  colors: string[] | string,
  lengthComparisonFn: () => {}
) {
  const colorsIsNotString = typeof colors !== 'string';

  // if color is not a string then check the length comparison
  if (colorsIsNotString) {
    validateParameters(featureProperty, lengthComparisonFn);
  } else {
    validateParameters(featureProperty);
  }
}

/**
 * Checks if the feature property is not null nor undefined
 * and the length comparison if it was provided.
 *
 * @param featureProperty - feature property to check if is not null nor undefined.
 * @param lengthComparisonFn - if provided, checks if it is valid.
 * @throws CartoStylingError if the parameters are invalid.
 */
export function validateParameters(
  featureProperty: string,
  lengthComparisonFn?: () => {}
) {
  if (!featureProperty) {
    throw new CartoStylingError(
      'Feature property is missing',
      stylingErrorTypes.PROPERTY_MISSING
    );
  }

  if (lengthComparisonFn) {
    const lengthMismatch = lengthComparisonFn();

    if (lengthMismatch) {
      throw new CartoStylingError(
        'Numeric values for ranges length and color/size length do not match',
        stylingErrorTypes.PROPERTY_MISMATCH
      );
    }
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
export function hexToRgb(hex: string): RGBAColor {
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

export function parseGeometryType(type: string): GeometryType {
  let s = type.replace(/(ST_)*(Multi)*(String)*/gi, '').toLowerCase();
  s = s.replace(/^\w/, c => c.toUpperCase());
  return s as GeometryType;
}

/**
 *
 * Checks if the bin parameters are valid.
 *
 * @param featureProperty
 * @param breaks
 * @param values
 * @throws CartoStylingError if the parameters are invalid.
 */
export function validateBinParameters(
  featureProperty: string,
  breaks: number[],
  values: string[] | string
) {
  const comparison = () => breaks.length - 1 !== values.length;
  validateParameters(featureProperty, comparison);
}

export function findIndexForBinBuckets(
  buckets: number[],
  featureValue: number
) {
  const rangeComparison = (
    definedValue: number,
    currentIndex: number,
    valuesArray: number[]
  ) =>
    featureValue < definedValue &&
    (currentIndex === 0 || featureValue >= valuesArray[currentIndex - 1]);

  return buckets.findIndex(rangeComparison);
}

export function validateCategoryParameters(
  featureProperty: string,
  values: number[] | string[],
  colors: string[] | string
) {
  const comparison = () => values.length !== colors.length;
  return validateColorParameters(featureProperty, colors, comparison);
}

export function calculateSizeBins(nBuckets: number, sizeRange: number[]) {
  // calculate sizes based on breaks and sizeRanges. We used the equal classifier
  const classObj = {
    min: sizeRange[0],
    max: sizeRange[1]
  };
  return new Classifier(classObj).breaks(nBuckets, 'equal');
}
