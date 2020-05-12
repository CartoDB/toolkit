import { StyledLayer, pixel2meters } from '../layer-style';
import { NumericFieldStats, GeometryType } from '../../sources/Source';
import { range } from './math-utils';
import {
  CartoStylingError,
  stylingErrorTypes
} from '../../errors/styling-error';
import { Style, BasicOptionsStyle, getStyles, getStyleValue } from '..';

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
    sizeRange: getStyleValue('sizeRange', geometryType, options),
    nullSize: getStyleValue('nullSize', geometryType, options),
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

    if (meta.geometryType === 'Polygon') {
      throw new CartoStylingError(
        "Polygon layer doesn't support sizeBinsStyle",
        stylingErrorTypes.GEOMETRY_TYPE_UNSUPPORTED
      );
    }

    const stats = meta.stats.find(
      f => f.name === featureProperty
    ) as NumericFieldStats;

    return calculate(
      featureProperty,
      layer,
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
  layerStyle: StyledLayer,
  geometryType: GeometryType,
  options: SizeContinuousOptionsStyle,
  rangeMin: number,
  rangeMax: number
) {
  const styles = getStyles(geometryType, options);

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

    if (featureValue === null || featureValue === undefined) {
      return options.nullSize;
    }

    const size = range(
      rangeMin,
      rangeMax,
      options.sizeRange[0],
      options.sizeRange[1],
      featureValue
    );

    return pixel2meters(size, layerStyle);
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

  let obj;

  if (geometryType === 'Point') {
    obj = {
      getRadius,
      pointRadiusMinPixels: options.sizeRange[0],
      pointRadiusMaxPixels: options.sizeRange[1],
      radiusUnits: 'pixels'
    };
  } else {
    obj = {
      getLineWidth,
      lineWidthMinPixels: options.sizeRange[0],
      lineWidthMaxPixels: options.sizeRange[1],
      radiusUnits: 'pixels'
    };
  }

  return {
    ...styles,
    ...obj,
    updateTriggers: { getRadius, getLineWidth }
  };
}
