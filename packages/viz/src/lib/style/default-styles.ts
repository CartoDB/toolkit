/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO remove any
import { hexToRgb } from './helpers/utils';
import { GeometryType } from '../sources/Source';

const defaults: any = {
  Point: {
    color: '#EE4D5A',
    size: 10,
    opacity: 1,
    strokeColor: '#22222299',
    strokeWidth: 1,
    nullColor: '#ccc',
    othersColor: '#777',
    sizeRange: [2, 14],
    nullSize: 0,
    palette: 'BluYl'
  },
  Line: {
    color: '#4CC8A3',
    size: 4,
    opacity: 1,
    nullColor: '#ccc',
    othersColor: '#777',
    sizeRange: [1, 10],
    palette: 'BluYl',
    nullSize: 0
  },
  Polygon: {
    color: '#826DBA',
    opacity: 0.9,
    strokeColor: '#2c2c2c99',
    strokeWidth: 1,
    nullColor: '#ccc',
    othersColor: '#777',
    palette: 'BluYl'
  }
};

export function getStyleValue(
  variable: string,
  geometryType: GeometryType,
  options: any
) {
  const opts = { ...defaults[geometryType], ...options };
  return opts[variable];
}

function pointStyles(opts: any) {
  return {
    opacity: getStyleValue('opacity', 'Point', opts),

    filled: true,
    getFillColor: hexToRgb(getStyleValue('color', 'Point', opts)),
    getRadius: getStyleValue('size', 'Point', opts) / 2,
    pointRadiusMinPixels: 2,
    pointRadiusMaxPixels: getStyleValue('size', 'Point', opts),

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
