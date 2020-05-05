import { RGBAColor } from '@deck.gl/aggregation-layers/utils/color-utils';

import {
  getColors,
  getUpdateTriggers,
  hexToRgb,
  validateBinParameters,
  findIndexForBinBuckets
} from './utils';

import { Classifier } from '../Classifier';
import { GeometryType, NumericFieldStats } from '../../types';

import { Style } from '../Style';
import { Source } from '../../sources/Source';
import { ColorBinsStyleOptions, defaultColorBinsStyleOptions } from './options';
import { applyDefaults } from '../default-styles';

export function colorBinsStyle(
  featureProperty: string,
  options: ColorBinsStyleOptions = defaultColorBinsStyleOptions
) {
  validateBinParameters(featureProperty, options.breaks, options.palette);

  const evalFN = (source: Source) => {
    const meta = source.getMetadata();

    if (!options.breaks.length) {
      const stats = meta.stats.find(
        f => f.name === featureProperty
      ) as NumericFieldStats;
      const classifier = new Classifier(stats);
      const breaks = classifier.breaks(options.bins, options.method);
      return calculateWithBreaks(
        featureProperty,
        breaks,
        meta.geometryType,
        options
      );
    }

    return calculateWithBreaks(
      featureProperty,
      options.breaks,
      meta.geometryType,
      options
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

    const featureValueIndex = findIndexForBinBuckets(ranges, featureValue);

    return rgbaColors[featureValueIndex] || rgbaOthersColor;
  };

  return {
    ...styles,
    getFillColor,
    updateTriggers: getUpdateTriggers({ getFillColor })
  };
}
