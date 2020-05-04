import { RGBAColor } from '@deck.gl/aggregation-layers/utils/color-utils';

import {
  getColors,
  getUpdateTriggers,
  hexToRgb,
  validateParameters
} from './utils';

import { ClassificationMethod, Classifier } from '../Classifier';
import { GeometryType, NumericFieldStats } from '../../types';
import { DefaultOptions, applyDefaults } from '../default-styles';

import { Style } from '../Style';
import { Source } from '../../sources/Source';

export function colorBinsStyle(
  featureProperty: string,
  options?: ColorBinsStyleOptions
) {
  const opts = { ...defaultOptions, ...options };

  validateBinParameters(featureProperty, opts.breaks, opts.palette);

  const evalFN = (source: Source) => {
    const meta = source.getMetadata();

    if (!opts.breaks.length) {
      const stats = meta.stats.find(
        f => f.name === featureProperty
      ) as NumericFieldStats;
      const classifier = new Classifier(stats);
      const breaks = classifier.breaks(opts.bins, opts.method);
      return calculateWithBreaks(
        featureProperty,
        breaks,
        meta.geometryType,
        opts
      );
    }

    return calculateWithBreaks(
      featureProperty,
      opts.breaks,
      meta.geometryType,
      opts
    );
  };

  return new Style(evalFN, featureProperty);
}

function calculateWithBreaks(
  featureProperty: string,
  breaks: number[],
  geometryType: GeometryType,
  options: ColorBinsStyleOptions
) {
  const styles = applyDefaults(geometryType, options);

  // For 3 breaks, we create 4 ranges of colors. For example: [30,80,120]
  // - From -inf to 29
  // - From 30 to 79
  // - From 80 to 119
  // - From 120 to +inf
  // Values lower than 0 will be in the first bucket and values higher than 120 will be in the last one.
  const ranges = [...breaks, Number.MAX_SAFE_INTEGER];

  const {
    rgbaColors,
    othersColor: rgbaOthersColor = hexToRgb(options.othersColor)
  } = getColors(options.palette, ranges.length);

  const rgbaNullColor = hexToRgb(options.nullColor);

  const getFillColor = (feature: Record<string, any>): RGBAColor => {
    const featureValue = feature.properties[featureProperty];

    if (!featureValue) {
      return rgbaNullColor;
    }

    // If we want to add various comparisons (<, >, <=, <=) like in TurboCARTO
    // we can change comparison within the arrow function to a comparison fn
    const rangeComparison = (
      definedValue: number,
      currentIndex: number,
      valuesArray: number[]
    ) =>
      featureValue < definedValue &&
      (currentIndex === 0 || featureValue >= valuesArray[currentIndex - 1]);

    const featureValueIndex = ranges.findIndex(rangeComparison);
    return rgbaColors[featureValueIndex] || rgbaOthersColor;
  };

  return {
    ...styles,
    getFillColor,
    updateTriggers: getUpdateTriggers({ getFillColor })
  };
}

function validateBinParameters(
  featureProperty: string,
  values: number[] | string[],
  palette: string[] | string
) {
  const comparison = () => values.length !== palette.length - 1;
  return validateParameters(featureProperty, palette, comparison);
}

interface ColorBinsStyleOptions extends DefaultOptions {
  // Number of size classes (bins) for map. Default is 5.
  bins: number;
  // Classification method of data: "quantiles", "equal", "stdev". Default is "quantiles".
  method: ClassificationMethod;
  // Assign manual class break values.
  breaks: number[];
  // Palette that can be a named cartocolor palette or an array of colors to use.
  palette: string[] | string;
  nullColor: string;
  othersColor: string;
}

const defaultOptions: ColorBinsStyleOptions = {
  bins: 5,
  method: 'quantiles',
  breaks: [],
  palette: 'purpor',
  nullColor: '#00000000',
  othersColor: '#00000000'
};
