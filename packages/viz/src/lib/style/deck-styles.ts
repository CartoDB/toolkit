/* eslint-disable @typescript-eslint/no-explicit-any */
import { hexToRgb } from './helpers/utils';
import { GeometryType } from '../sources/Source';
import { defaultStyles } from './default-styles';

function pointStyles(opts: any) {
  return {
    opacity: getStyleValue('opacity', 'Point', opts),

    filled: true,
    getFillColor: hexToRgb(getStyleValue('color', 'Point', opts)),
    pointRadiusMinPixels: getStyleValue('size', 'Point', opts) / 2,
    pointRadiusMaxPixels: getStyleValue('size', 'Point', opts) / 2,

    stroked: true,
    getLineColor: hexToRgb(getStyleValue('strokeColor', 'Point', opts)),
    lineWidthUnits: 'pixels'
  };
}

function lineStyles(opts: any) {
  return {
    opacity: getStyleValue('opacity', 'Line', opts),
    getLineColor: getStyleValue('color', 'Line', opts),
    getLineWidth: getStyleValue('strokeWidth', 'Polygon', opts),
    lineWidthMinPixels: 1,
    lineWidthUnits: 'pixels'
  };
}

function polygonStyles(opts: any) {
  return {
    opacity: getStyleValue('opacity', 'Polygon', opts),

    getFillColor: hexToRgb(getStyleValue('color', 'Polygon', opts)),
    filled: true,

    stroked: true,
    getLineColor: hexToRgb(getStyleValue('strokeColor', 'Polygon', opts)),
    getLineWidth: getStyleValue('strokeWidth', 'Polygon', opts),
    lineWidthMinPixels: 1,
    lineWidthUnits: 'pixels'
  };
}

export function getStyleValue(
  variable: string,
  geometryType: GeometryType,
  options: any
) {
  const opts = { ...defaultStyles[geometryType], ...options };
  return opts[variable];
}

export interface BasicOptionsStyle {
  // Color: hex, rgb or named color value.
  // Defaults is '#EE4D5A' points, '#4CC8A3'lines and '#826DBA' polygons
  color: string;
  // Size of point or line features. 10 for points and 4 for lines.
  size: number;
  // Opacity value. Default is 1 for points and lines and 0.9 for polygons.
  opacity: number;
  // Color of the stroke. Default is '#222'.
  strokeColor: string;
  // Size of the stroke
  strokeWidth: number;
}

export function getStyles(
  geometryType: GeometryType,
  options: Partial<BasicOptionsStyle> = {}
) {
  let styles;

  switch (geometryType) {
    case 'Point':
      styles = pointStyles(options);
      break;
    case 'Line':
      styles = lineStyles(options);
      break;
    case 'Polygon':
      styles = polygonStyles(options);
      break;
    default:
      throw new Error('Unsupported geometry type');
  }

  // Return a copy
  return { ...styles };
}
