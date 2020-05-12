import { scale as chromaScale } from 'chroma-js';
import { getColors, getUpdateTriggers, hexToRgb } from './utils';
import { Style } from '../Style';

import { StyledLayer } from '../layer-style';
import { toDeckStyles } from './style-transform';
import { NumericFieldStats, GeometryType } from '../../sources/Source';
import {
  ColorContinuousStyleOptions,
  defaultColorContinuousStyleOptions
} from './style-options';

export function colorContinuousStyle(
  featureProperty: string,
  options?: ColorContinuousStyleOptions
) {
  const opts = { ...defaultColorContinuousStyleOptions, ...options };

  const evalFN = (layer: StyledLayer) => {
    const meta = layer.source.getMetadata();
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
  const styles = toDeckStyles(geometryType, options);
  const colors = getColors(options.palette, options.palette.length);
  const nullColor = hexToRgb(options.nullColor);

  const colorScale = chromaScale([colors[0], colors[colors.length - 1]])
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

  return {
    ...styles,
    getFillColor,
    updateTriggers: getUpdateTriggers({ getFillColor })
  };
}
