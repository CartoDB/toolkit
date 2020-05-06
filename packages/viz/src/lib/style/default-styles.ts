import { hexToRgb } from './helpers/utils';
import { GeometryType } from '../global-interfaces';
import { DefaultOptions } from './default-styles-options';

const pointStyles = {
  opacity: 1.0,
  stroked: true,
  filled: true,

  getFillColor: hexToRgb('#FFB927'),
  getLineColor: hexToRgb('#222'),
  getRadius: 5,

  pointRadiusMinPixels: 2,
  pointRadiusMaxPixels: 10,

  lineWidthUnits: 'pixels'
};

const lineStyles = {
  getLineColor: hexToRgb('#4CC8A3'),
  opacity: 0.9,
  lineWidthMinPixels: 1,
  lineWidthUnits: 'pixels'
};

const polygonStyles = {
  opacity: 0.9,
  stroked: true,
  filled: true,

  getFillColor: hexToRgb('#FFB927'),
  getLineColor: hexToRgb('#4CC8A3'),
  getLineWidth: 1,

  lineWidthMinPixels: 1,
  lineWidthUnits: 'pixels'
};

export function defaultStyles(geometryType: GeometryType) {
  let styles;

  switch (geometryType) {
    case 'Point':
      styles = pointStyles;
      break;
    case 'Line':
      styles = lineStyles;
      break;
    case 'Polygon':
      styles = polygonStyles;
      break;
    default:
      throw new Error('Unsupported geometry type');
  }

  // Return a copy
  return { ...styles };
}

// const STYLES_MAP = {
//   Point: {
//     size: 'getRadius',
//     strokeColor: 'getLineColor',
//     strokeWidth: 'getLineWidth'
//   },
//   Line: {
//     strokeColor: 'getLineColor',
//     strokeWidth: 'getLineWidth'
//   },
//   Polygon: {
//     strokeColor: 'getLineColor',
//     strokeWidth: 'getLineWidth'
//   }
// };

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
    styles.opacity =
      typeof options.opacity === 'number'
        ? options.opacity
        : options.opacity[geometryType];
  }

  return styles;
}
