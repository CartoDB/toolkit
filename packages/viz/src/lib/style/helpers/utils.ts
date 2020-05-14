import { RGBAColor } from '@deck.gl/core';
import { getColorPalette } from '../palettes';
import { Classifier } from '../../utils/Classifier';
import { GeometryType } from '../../sources/Source';

export function getUpdateTriggers(accessorFunction: Record<string, unknown>) {
  return {
    getFillColor: [accessorFunction.getFillColor]
  };
}

// export function getColors(
//   colorProperty: string | string[],
//   colorLength: number
// ) {
//   if (typeof colorProperty === 'string') {
//     const { colors: rgbaColors, othersColor } = getColorPalette(
//       colorProperty.toUpperCase(),
//       colorLength
//     );

//     return {
//       rgbaColors: rgbaColors.map(hexToRgb),
//       othersColor: othersColor ? hexToRgb(othersColor) : undefined
//     };
//   }

//   return { rgbaColors: (colorProperty as string[]).map(hexToRgb) };
// }

export function getColors(
  colorProperty: string | string[],
  colorLength: number
) {
  if (typeof colorProperty === 'string') {
    const { colors } = getColorPalette(
      colorProperty.toUpperCase(),
      colorLength
    );
    return colors;
  }

  return colorProperty;
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

export function calculateSizeBins(nBreaks: number, sizeRange: number[]) {
  // calculate sizes based on breaks and sizeRanges. We used the equal classifier
  const classObj = {
    min: sizeRange[0],
    max: sizeRange[1]
  };
  return [
    sizeRange[0],
    ...new Classifier(classObj).breaks(nBreaks - 1, 'equal'),
    sizeRange[1]
  ];
}
