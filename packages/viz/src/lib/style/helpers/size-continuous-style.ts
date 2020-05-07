import { StyledLayer, pixel2meters } from '../layer-style';
import { toDeckStyles } from './style-transform';
import { NumericFieldStats, GeometryType } from '../../sources/Source';
import { range } from './utils';
import {
  CartoStylingError,
  stylingErrorTypes
} from '../../errors/styling-error';
import {
  SizeContinuousStyleOptions,
  defaultSizeContinuousStyleOptions
} from './style-options';
import { Style } from '..';

export function sizeContinuousStyle(
  featureProperty: string,
  options?: SizeContinuousStyleOptions
) {
  const opts = { ...defaultSizeContinuousStyleOptions, ...options };

  const evalFN = (layer: StyledLayer) => {
    const meta = layer.source.getMetadata();

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
      opts.rangeMin || stats.min,
      opts.rangeMax || stats.max
    );
  };

  return new Style(evalFN, featureProperty);
}

function calculate(
  featureProperty: string,
  layerStyle: StyledLayer,
  geometryType: GeometryType,
  options: SizeContinuousStyleOptions,
  rangeMin: number,
  rangeMax: number
) {
  const styles = toDeckStyles(geometryType, options);

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
