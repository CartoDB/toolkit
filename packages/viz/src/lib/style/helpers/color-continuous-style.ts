import { scale as chromaScale } from 'chroma-js';
import { getColors, getUpdateTriggers, hexToRgb } from './utils';
import { StyledLayer } from '../layer-style';
import { NumericFieldStats, GeometryType } from '../../sources/Source';
import { BasicOptionsStyle, getStyleValue, getStyles, Style } from '..';
import {
  CartoStylingError,
  stylingErrorTypes
} from '../../errors/styling-error';
import { colorValidation } from '../validators';

const DEFAULT_PALETTE = 'BluYl';

export interface ColorContinuousOptionsStyle
  extends Partial<BasicOptionsStyle> {
  // The minimum value of the data range for the continuous color ramp. Defaults to the globalMIN of the dataset.
  rangeMin?: number;
  // The maximum value of the data range for the continuous color ramp. Defaults to the globalMAX of the dataset.
  rangeMax?: number;
  // Palette that can be a named cartocolor palette or other valid color palette.
  palette: string[] | string;
  // Color applied to features which the attribute value is null.
  nullColor: string;
}

function defaultOptions(
  geometryType: GeometryType,
  options: Partial<ColorContinuousOptionsStyle>
): ColorContinuousOptionsStyle {
  return {
    strokeWidth: 0,
    palette: DEFAULT_PALETTE,
    nullColor: getStyleValue('nullColor', geometryType, options),
    ...options
  };
}

export function colorContinuousStyle(
  featureProperty: string,
  options: Partial<ColorContinuousOptionsStyle> = {}
) {
  const evalFN = (layer: StyledLayer) => {
    const meta = layer.source.getMetadata();
    const opts = defaultOptions(meta.geometryType, options);

    validateParameters(opts);

    const stats = meta.stats.find(
      f => f.name === featureProperty
    ) as NumericFieldStats;

    if (stats.min === undefined || stats.max === undefined) {
      throw new Error('Need max/min');
    }

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
  options: ColorContinuousOptionsStyle,
  rangeMin: number,
  rangeMax: number
) {
  const styles = getStyles(geometryType, options);
  const colors = getColors(options.palette);
  const nullColor = hexToRgb(options.nullColor);

  const colorScale = chromaScale(colors)
    .domain([rangeMin, rangeMax])
    .mode('lrgb');

  const getFillColor = (
    feature: Record<string, Record<string, number | string>>
  ) => {
    const featureValue = Number(feature.properties[featureProperty]);

    if (!featureValue) {
      return nullColor;
    }

    return colorScale(featureValue).rgb();
  };

  let geomStyles;

  if (geometryType === 'Line') {
    geomStyles = {
      getLineColor: getFillColor,
      updateTriggers: getUpdateTriggers({
        getLineColor: getFillColor
      })
    };
  } else {
    geomStyles = {
      getFillColor,
      updateTriggers: getUpdateTriggers({
        getFillColor
      })
    };
  }

  return {
    ...styles,
    ...geomStyles
  };
}

function validateParameters(options: ColorContinuousOptionsStyle) {
  if (
    options.rangeMin &&
    options.rangeMax &&
    options.rangeMin >= options.rangeMax
  ) {
    throw new CartoStylingError(
      'rangeMax should be greater than rangeMin',
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }

  if (options.nullColor && !colorValidation(options.nullColor)) {
    throw new CartoStylingError(
      `nullColor '${options.color}' is not valid`,
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }
}
