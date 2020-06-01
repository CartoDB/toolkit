import { StyledLayer } from '../layer-style';
import { NumericFieldStats, GeometryType } from '../../sources/Source';
import { range } from './math-utils';
import {
  CartoStylingError,
  stylingErrorTypes
} from '../../errors/styling-error';
import { Style, BasicOptionsStyle, getStyles, getStyleValue } from '..';
import { sizeRangeValidation } from '../validators';

export interface SizeContinuousOptionsStyle extends Partial<BasicOptionsStyle> {
  // The minimum value of the data range for the size ramp. Defaults to the globalMIN of the dataset.
  rangeMin?: number;
  // The maximum value of the data range for the size ramp. Defaults to the globalMAX of the dataset.
  rangeMax?: number;
  // Min/max size array as a string. Default is [2, 14] for point geometries and [1, 10] for lines.
  sizeRange: number[];
  // Size applied to features which the attribute value is null. Default 0
  nullSize: number;
}

function defaultOptions(
  geometryType: GeometryType,
  options: Partial<SizeContinuousOptionsStyle>
): SizeContinuousOptionsStyle {
  return {
    color: getDefaultColor(geometryType),
    sizeRange: getDefaultSizeRange(geometryType),
    nullSize: getStyleValue('nullSize', geometryType, options),
    opacity: 0.7,
    ...options
  };
}

export function sizeContinuousStyle(
  featureProperty: string,
  options: Partial<SizeContinuousOptionsStyle> = {}
) {
  const evalFN = (layer: StyledLayer) => {
    const meta = layer.source.getMetadata();
    const opts = defaultOptions(meta.geometryType, options);
    validateParameters(opts, meta.geometryType);

    const stats = meta.stats.find(
      f => f.name === featureProperty
    ) as NumericFieldStats;

    return calculate(
      featureProperty,
      meta.geometryType,
      opts,
      opts.rangeMin === undefined ? stats.min : opts.rangeMin,
      opts.rangeMax === undefined ? stats.max : opts.rangeMax
    );
  };

  return new Style(evalFN, featureProperty);
}

function calculate(
  featureProperty: string,
  geometryType: GeometryType,
  options: SizeContinuousOptionsStyle,
  rangeMin: number,
  rangeMax: number
) {
  const styles = getStyles(geometryType, options);

  let rangeMinValue = rangeMin;
  let rangeMaxValue = rangeMax;

  if (geometryType === 'Point') {
    rangeMinValue = Math.sqrt(rangeMin);
    rangeMaxValue = Math.sqrt(rangeMax);
  }

  /**
   * @private
   * Gets the size for the feature provided by parameter
   * according to the breaks and sizes options.
   *
   * @param feature - feature used to calculate the size.
   * @returns size.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getSizeValue = (feature: Record<string, any>) => {
    let featureValue: number = feature.properties[featureProperty];

    if (featureValue === null || featureValue === undefined) {
      return options.nullSize;
    }

    if (geometryType === 'Point') {
      featureValue = Math.sqrt(featureValue);
    }

    return range(
      rangeMinValue,
      rangeMaxValue,
      options.sizeRange[0],
      options.sizeRange[1],
      featureValue
    );
  };

  let obj;

  if (geometryType === 'Point') {
    obj = {
      getRadius: getSizeValue,
      pointRadiusMinPixels: options.sizeRange[0],
      pointRadiusMaxPixels: options.sizeRange[1],
      radiusUnits: 'pixels'
    };
  } else {
    obj = {
      getLineWidth: getSizeValue,
      lineWidthMinPixels: options.sizeRange[0],
      lineWidthMaxPixels: options.sizeRange[1],
      radiusUnits: 'pixels'
    };
  }

  return {
    ...styles,
    ...obj,
    updateTriggers: { getRadius: getSizeValue, getLineWidth: getSizeValue }
  };
}

export function getDefaultSizeRange(geometryType: GeometryType) {
  const defaultSizeRange = {
    Point: [2, 40],
    Line: [1, 10],
    Polygon: []
  };

  return defaultSizeRange[geometryType];
}

function getDefaultColor(geometryType: GeometryType) {
  if (geometryType === 'Point') {
    return '#FFB927';
  }

  return getStyleValue('color', geometryType, {});
}

function validateParameters(
  options: SizeContinuousOptionsStyle,
  geometryType: GeometryType
) {
  if (geometryType === 'Polygon') {
    throw new CartoStylingError(
      "Polygon layer doesn't support sizeContinuousStyle",
      stylingErrorTypes.GEOMETRY_TYPE_UNSUPPORTED
    );
  }

  if (
    options.rangeMin &&
    options.rangeMax &&
    options.rangeMin >= options.rangeMax
  ) {
    throw new CartoStylingError(
      'rangeMin must be greater than rangeMin',
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }

  if (options.sizeRange && !sizeRangeValidation(options.sizeRange)) {
    throw new CartoStylingError(
      'sizeRange must be an array of 2 numbers, [min, max]',
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }

  if (options.nullSize && options.nullSize < 0) {
    throw new CartoStylingError(
      'nullSize must be greater or equal to 0',
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }
}
