import { RGBAColor } from '@deck.gl/aggregation-layers/utils/color-utils';
import { getColorPalette } from '../palettes';
import { GeometryType } from '../../global-interfaces';
import { Classifier } from '../Classifier';
import { CartoStylingError } from '../../errors/styling-error';
import { LayerStyle } from '../layer-style';

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

export function calculateSizeBins(nBuckets: number, sizeRange: number[]) {
  // calculate sizes based on breaks and sizeRanges. We used the equal classifier
  const classObj = {
    min: sizeRange[0],
    max: sizeRange[1]
  };
  return new Classifier(classObj).breaks(nBuckets, 'equal');
}
