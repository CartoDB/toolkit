import { hexToRgb } from './helpers/utils';
import { GeometryType } from '../global-interfaces';

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
