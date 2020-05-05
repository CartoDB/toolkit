import {
  validateParameters,
  findIndexForBinBuckets,
  calculateSizeBins
} from './utils';
import { SizeBinsStyleOptions, defaultSizeBinsStyleOptions } from './options';
import { Style } from '..';
import { Source } from '../../sources/Source';
import { NumericFieldStats, GeometryType } from '../../types';
import { Classifier } from '../Classifier';
import { applyDefaults } from '../default-styles';

export function sizeBinsStyle(
  featureProperty: string,
  options: SizeBinsStyleOptions = defaultSizeBinsStyleOptions
) {
  validateParameters(featureProperty);

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
  options: SizeBinsStyleOptions
) {
  const styles = applyDefaults(geometryType, options);

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
    return sizes[featureValueIndex];
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

  return {
    ...styles,
    getRadius,
    getLineWidth,
    pointRadiusMinPixels: minSize,
    pointRadiusMaxPixels: maxSize,
    radiusUnits: 'pixels',
    lineWidthMinPixels: minSize,
    lineWidthMaxPixels: maxSize,
    lineWidthUnits: 'pixels',
    updateTriggers: { getRadius, getLineWidth }
  };
}
