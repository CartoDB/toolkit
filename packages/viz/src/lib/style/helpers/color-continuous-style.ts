import { mix as chromaMix } from 'chroma-js';
import { getColors, getUpdateTriggers, hexToRgb } from './utils';
import { Style } from '../Style';
import { StyledLayer } from '../layer-style';
import { NumericFieldStats, GeometryType } from '../../sources/Source';
import { BasicOptionsStyle, getStyleValue, getStyles } from '..';
import { invlerp } from './math-utils';

export interface ColorContinuousStyleOptions
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
  options: Partial<ColorContinuousStyleOptions>
): ColorContinuousStyleOptions {
  return {
    palette: getStyleValue('palette', geometryType, options),
    nullColor: getStyleValue('nullColor', geometryType, options),
    ...options
  };
}

export function colorContinuousStyle(
  featureProperty: string,
  options: Partial<ColorContinuousStyleOptions> = {}
) {
  const evalFN = (layer: StyledLayer) => {
    const meta = layer.source.getMetadata();
    const opts = defaultOptions(meta.geometryType, options);

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
      opts.rangeMin || stats.min,
      opts.rangeMax || stats.max
    );
  };

  return new Style(evalFN, featureProperty);
}

function calculate(
  featureProperty: string,
  geometryType: GeometryType,
  options: ColorContinuousStyleOptions,
  rangeMin: number,
  rangeMax: number
) {
  const styles = getStyles(geometryType, options);
  const colors = getColors(options.palette, options.palette.length);
  const nullColor = hexToRgb(options.nullColor);

  const getFillColor = (
    feature: Record<string, Record<string, number | string>>
  ) => {
    const featureValue = Number(feature.properties[featureProperty]);

    if (!featureValue) {
      return nullColor;
    }

    const valueInterpolation = invlerp(rangeMin, rangeMax, featureValue);
    const interpolatedColor = chromaMix(
      colors[0],
      colors[colors.length - 1],
      valueInterpolation
    ).hex();
    return hexToRgb(interpolatedColor);
  };

  return {
    ...styles,
    getFillColor,
    updateTriggers: getUpdateTriggers({ getFillColor })
  };
}
