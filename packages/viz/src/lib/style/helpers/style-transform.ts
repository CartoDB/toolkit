import { DefaultStyleOptions, defaultStyles } from '..';
import { hexToRgb } from './utils';
import { GeometryType } from '../../sources/Source';

const MAP = {
  Point: {
    color: 'getFillColor',
    size: 'getRadius',
    strokeColor: 'getLineColor',
    strokeWidth: 'getLineWidth'
  },
  Line: {
    color: 'getFillColor',
    size: 'getLineWidth',
    strokeColor: 'getLineColor',
    strokeWidth: 'getLineWidth'
  },
  Polygon: {
    color: 'getFillColor',
    strokeColor: 'getLineColor',
    strokeWidth: 'getLineWidth'
  }
};

export function toDeckStyles(
  geometryType: GeometryType,
  options: DefaultStyleOptions
) {
  const styles: any = defaultStyles(geometryType);
  const mapKeys: any = MAP[geometryType];

  if (options.color !== undefined) {
    styles[mapKeys.color] =
      typeof options.color === 'string'
        ? hexToRgb(options.color)
        : hexToRgb(options.color[geometryType]);
  }

  if (options.size !== undefined) {
    if (geometryType === 'Point') {
      // Radius is reduced by two. We're not exposing radius at the user.
      styles[mapKeys.size] = options.size / 2;
    } else if (geometryType === 'Line') {
      styles[mapKeys.size] = options.size;
    }
  }

  if (options.strokeColor !== undefined) {
    styles[mapKeys.strokeColor] = hexToRgb(options.strokeColor);
  }

  if (options.strokeWidth !== undefined) {
    styles[mapKeys.strokeWidth] = options.strokeWidth;
  }

  if (options.opacity !== undefined) {
    styles.opacity =
      typeof options.opacity === 'number'
        ? options.opacity
        : options.opacity[geometryType];
  }

  return styles;
}
