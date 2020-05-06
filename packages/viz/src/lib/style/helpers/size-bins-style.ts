import { findIndexForBinBuckets, calculateSizeBins } from './utils';
import { Style, SizeBinsStyleOptions, defaultSizeBinsStyleOptions } from '..';
import { NumericFieldStats, GeometryType } from '../../global-interfaces';
import { Classifier } from '../../utils/Classifier';
import {
  CartoStylingError,
  stylingErrorTypes
} from '../../errors/styling-error';
import { LayerStyle, pixel2meters } from '../layer-style';
import { toDeckStyles } from './style-transform';

export function sizeBinsStyle(
  featureProperty: string,
  options?: SizeBinsStyleOptions
) {
  const opts = { ...defaultSizeBinsStyleOptions, ...options };
  validateParameters(opts);

  const evalFN = (layer: LayerStyle) => {
    const meta = layer.source.getMetadata();

    if (meta.geometryType === 'Polygon') {
      throw new CartoStylingError(
        "Polygon layer doesn't support sizeBinsStyle",
        stylingErrorTypes.GEOMETRY_TYPE_UNSUPPORTED
      );
    }

    if (!opts.breaks.length) {
      const stats = meta.stats.find(
        f => f.name === featureProperty
      ) as NumericFieldStats;
      const classifier = new Classifier(stats);
      const breaks = classifier.breaks(opts.bins, opts.method);
      return calculateWithBreaks(
        featureProperty,
        layer,
        breaks,
        meta.geometryType,
        opts
      );
    }

    return calculateWithBreaks(
      featureProperty,
      layer,
      opts.breaks,
      meta.geometryType,
      opts
    );
  };

  return new Style(evalFN, featureProperty);
}

function calculateWithBreaks(
  featureProperty: string,
  layerStyle: LayerStyle,
  breaks: number[],
  geometryType: GeometryType,
  options: SizeBinsStyleOptions
) {
  const styles = toDeckStyles(geometryType, options);

  // For 3 breaks, we create 4 ranges of colors. For example: [30,80,120]
  // - From -inf to 29
  // - From 30 to 79
  // - From 80 to 119
  // - From 120 to +inf
  // Values lower than 0 will be in the first bucket and values higher than 120 will be in the last one.
  const ranges = [...breaks, Number.MAX_SAFE_INTEGER];

  // calculate sizes based on breaks and sizeRanges.
  const sizes = calculateSizeBins(breaks.length, options.sizeRange);

  /**
   * @private
   * Gets the size for the feature provided by parameter
   * according to the breaks and sizes options.
   *
   * @param feature - feature used to calculate the size.
   * @returns size.
   */
  const getSizeValue = (feature: Record<string, any>) => {
    const featureValue: number = feature.properties[featureProperty];

    if (!featureValue) {
      return options.nullSize;
    }

    const featureValueIndex = findIndexForBinBuckets(ranges, featureValue);
    return pixel2meters(sizes[featureValueIndex], layerStyle);
  };

  /**
   * @public
   * Calculates the radius size for the feature provided
   * by parameter according to the breaks and sizes.
   *
   * @param feature - feature used to calculate the radius size.
   * @returns radio size.
   */
  const getRadius = (feature: Record<string, any>) => {
    return getSizeValue(feature);
  };

  /**
   * @public
   * Calculates the line width for the feature provided
   * by parameter according to the breaks and sizes.
   *
   * @param feature - feature used to calculate the line width.
   * @returns radio size.
   */
  const getLineWidth = (feature: Record<string, any>) => {
    return getSizeValue(feature);
  };

  // gets the min and max size
  const minSize = Math.min(...sizes, options.nullSize);
  const maxSize = Math.max(...sizes, options.nullSize);

  let obj;

  if (geometryType === 'Point') {
    obj = {
      getRadius,
      pointRadiusMinPixels: minSize,
      pointRadiusMaxPixels: maxSize,
      radiusUnits: 'pixels'
    };
  } else {
    obj = {
      getLineWidth,
      lineWidthMinPixels: minSize,
      lineWidthMaxPixels: maxSize,
      radiusUnits: 'pixels'
    };
  }

  return {
    ...styles,
    ...obj,
    updateTriggers: { getRadius, getLineWidth }
  };
}

function validateParameters(options: SizeBinsStyleOptions) {
  if (options.breaks.length > 0 && options.breaks.length !== options.bins) {
    throw new CartoStylingError(
      'Manual breaks are provided and bins!=breaks.length',
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }
}
