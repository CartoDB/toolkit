import {
  getColors,
  getUpdateTriggers,
  hexToRgb,
  findIndexForBinBuckets
} from './utils';

import { Classifier } from '../../utils/Classifier';
import { Style } from '../Style';
import {
  CartoStylingError,
  stylingErrorTypes
} from '../../errors/styling-error';
import { ColorBinsStyleOptions, defaultColorBinsStyleOptions } from '..';
import { StyledLayer } from '../layer-style';
import { toDeckStyles } from './style-transform';
import { NumericFieldStats, GeometryType } from '../../sources/Source';

export function colorBinsStyle(
  featureProperty: string,
  options?: ColorBinsStyleOptions
) {
  const opts = { ...defaultColorBinsStyleOptions, ...options };

  validateParameters(opts);

  const evalFN = (layer: StyledLayer) => {
    const meta = layer.source.getMetadata();

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
  const styles = toDeckStyles(geometryType, options);

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

  const getFillColor = (feature: Record<string, any>) => {
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

function validateParameters(options: ColorBinsStyleOptions) {
  if (options.breaks.length > 0 && options.breaks.length !== options.bins) {
    throw new CartoStylingError(
      'Manual breaks are provided and bins!=breaks.length',
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }

  if (
    options.breaks.length > 0 &&
    options.breaks.length !== options.palette.length
  ) {
    throw new CartoStylingError(
      'Manual breaks are provided and breaks.length!=and palette.length',
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }

  if (
    options.breaks.length === 0 &&
    Array.isArray(options.palette) &&
    options.bins !== options.palette.length
  ) {
    throw new CartoStylingError(
      'Number of bins does not match with palette length',
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }
}
