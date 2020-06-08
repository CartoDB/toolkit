/* eslint-disable @typescript-eslint/no-explicit-any */
import { hexToRgb } from './helpers/utils';
import { GeometryType } from '../sources/Source';
import { defaultStyles } from './default-styles';
import { colorValidation } from './validators';
import { CartoStylingError, stylingErrorTypes } from '../errors/styling-error';

const POINTS_WIDTH_FACTOR = 2;

function pointStyles(opts: any) {
  return {
    opacity: getStyleValue('opacity', 'Point', opts),

    filled: true,
    getFillColor: hexToRgb(getStyleValue('color', 'Point', opts)),
    pointRadiusMinPixels: 0,
    pointRadiusMaxPixels: Number.MAX_SAFE_INTEGER,
    getRadius: getStyleValue('size', 'Point', opts),
    pointRadiusScale: 1 / POINTS_WIDTH_FACTOR,
    pointRadiusUnits: 'pixels',

    stroked: true,
    getLineColor: hexToRgb(getStyleValue('strokeColor', 'Point', opts)),
    getLineWidth: getStyleValue('strokeWidth', 'Point', opts),
    lineWidthUnits: 'pixels'
  };
}

function lineStyles(opts: any) {
  return {
    opacity: getStyleValue('opacity', 'Line', opts),
    getLineColor: hexToRgb(getStyleValue('color', 'Line', opts)),
    getLineWidth: getStyleValue('size', 'Line', opts),
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
    lineWidthMinPixels: 0,
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
  validateBasicParameters(options);

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

function validateBasicParameters(options: Partial<BasicOptionsStyle>) {
  if (options.color && !colorValidation(options.color)) {
    throw new CartoStylingError(
      `color '${options.color}' is not valid`,
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }

  if (options.size && options.size < 1) {
    throw new CartoStylingError(
      `size '${options.size}' must be greater or equal to 1`,
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }

  if (options.opacity && (options.opacity > 1 || options.opacity < 0)) {
    throw new CartoStylingError(
      `opacity '${options.opacity}' must be a number between 0 and 1`,
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }

  if (options.strokeColor && !colorValidation(options.strokeColor)) {
    throw new CartoStylingError(
      `strokeColor '${options.strokeColor}' is not valid`,
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }

  if (options.strokeWidth && options.strokeWidth < 0) {
    throw new CartoStylingError(
      `strokeWidth '${options.opacity}' must be greater or equal to 0`,
      stylingErrorTypes.PROPERTY_MISMATCH
    );
  }
}
