import { hexToRgb } from './helpers/utils';
import { GeometryType } from '../types';

const pointStyles = {
  opacity: 1.0,
  stroked: true,
  filled: true,

  getFillColor: [238, 77, 90],
  getLineColor: hexToRgb('#222'),
  getRadius: 5,

  pointRadiusMinPixels: 2,
  pointRadiusMaxPixels: 10,

  lineWidthUnits: 'pixels'
};

const lineStyles = {
  getLineColor: [76, 200, 163],
  opacity: 0.9,
  lineWidthMinPixels: 1,
  lineWidthUnits: 'pixels'
};

const polygonStyles = {
  opacity: 0.9,
  stroked: true,
  filled: true,

  getFillColor: [130, 109, 186, 255],
  getLineColor: [44, 44, 44],
  getLineWidth: 1,

  lineWidthMinPixels: 1,
  lineWidthUnits: 'pixels'
};

export function defaultStyles(geometryType: GeometryType) {
  let styles;

  switch (geometryType) {
    case GeometryType.Point:
      styles = pointStyles;
      break;
    case GeometryType.Line:
      styles = lineStyles;
      break;
    case GeometryType.Polygon:
      styles = polygonStyles;
      break;
    default:
      throw new Error('Unsupported geometry type');
  }

  // Return a copy
  return { ...styles };
}

export const STYLES_MAP = {
  Point: {
    size: 'getRadius',
    strokeColor: 'getLineColor',
    strokeWidth: 'getLineWidth',
    opacity: 1.0
  },
  Line: {
    strokeColor: 'getLineColor',
    strokeWidth: 'getLineWidth',
    opacity: 0.9
  },
  Polygon: {
    strokeColor: 'getLineColor',
    strokeWidth: 'getLineWidth',
    opacity: 0.9
  }
};

export interface DefaultOptions {
  // Size of point or line features.
  size?: number;
  // Opacity value. Default is 1 for points and lines and 0.9 for polygons.
  opacity?: number;
  // Color of the stroke. Default is '#222'.
  strokeColor?: string;
  // Size of the stroke
  strokeWidth?: number;
}

export function applyDefaults(
  geometryType: GeometryType,
  options: DefaultOptions
) {
  const styles: any = defaultStyles(geometryType);

  if (options.size !== undefined) {
    // Radius is reduced by two. We're not exposing radius at the user.
    styles[styles.size] = options.size / 2;
  }

  if (options.strokeColor !== undefined) {
    styles[styles.strokeColor] = options.strokeColor;
  }

  if (options.strokeWidth !== undefined) {
    styles[styles.strokeWidth] = options.strokeWidth;
  }

  if (options.opacity !== undefined) {
    styles.opacity = options.opacity;
  }

  return styles;
}
