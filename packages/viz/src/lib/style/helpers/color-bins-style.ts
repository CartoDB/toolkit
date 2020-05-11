import {
  getColors,
  getUpdateTriggers,
  hexToRgb,
  findIndexForBinBuckets
} from './utils';

import { Classifier, ClassificationMethod } from '../../utils/Classifier';
import { Style } from '../Style';
import {
  CartoStylingError,
  stylingErrorTypes
} from '../../errors/styling-error';
import { StyledLayer } from '../layer-style';
import { NumericFieldStats, GeometryType } from '../../sources/Source';
import { getStyleValue, BasicOptionsStyle, getStyles } from '../default-styles';

export interface ColorBinsOptionsStyle extends Partial<BasicOptionsStyle> {
  // Number of size classes (bins) for map. Default is 5.
  bins: number;
  // Classification method of data: "quantiles", "equal", "stdev". Default is "quantiles".
  method: ClassificationMethod;
  // Assign manual class break values.
  breaks: number[];
  // Palette that can be a named cartocolor palette or other valid color palette.
  palette: string[] | string;
  // Color applied to features which the attribute value is null.
  nullColor: string;
  // Color applied to features which the attribute value is not in the breaks.
  othersColor: string;
}

function defaultOptions(
  geometryType: GeometryType,
  options: Partial<ColorBinsOptionsStyle>
): ColorBinsOptionsStyle {
  return {
    bins: 5,
    method: 'quantiles',
    breaks: [],
    palette: getStyleValue('palette', geometryType, options),
    nullColor: getStyleValue('nullColor', geometryType, options),
    othersColor: getStyleValue('othersColor', geometryType, options),
    ...options
  };
}

export function colorBinsStyle(
  featureProperty: string,
  options: Partial<ColorBinsOptionsStyle> = {}
) {
  const evalFN = (layer: StyledLayer) => {
    const meta = layer.source.getMetadata();
    const opts = defaultOptions(meta.geometryType, options);

    validateParameters(opts);

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
  options: ColorBinsOptionsStyle
) {
  const styles = getStyles(geometryType, options);

  // For 3 breaks, we create 4 ranges of colors. For example: [30,80,120]
  // - From -inf to 29
  // - From 30 to 79
  // - From 80 to 119
  // - From 120 to +inf
  // Values lower than 0 will be in the first bucket and values higher than 120 will be in the last one.
  const ranges = [...breaks, Number.MAX_SAFE_INTEGER];

  const colors = getColors(options.palette, ranges.length);
  const rgbaNullColor = hexToRgb(options.nullColor);

  const getFillColor = (feature: Record<string, any>) => {
    const featureValue = feature.properties[featureProperty];

    if (!featureValue) {
      return rgbaNullColor;
    }

    const featureValueIndex = findIndexForBinBuckets(ranges, featureValue);

    return hexToRgb(colors[featureValueIndex]);
  };

  return {
    ...styles,
    getFillColor,
    updateTriggers: getUpdateTriggers({ getFillColor })
  };
}

function validateParameters(options: ColorBinsOptionsStyle) {
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
