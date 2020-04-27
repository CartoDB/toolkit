import { Style } from './Style';

const pointStyles = new Style({
  stroked: false,
  filled: true,

  getFillColor: [238, 77, 90],
  getRadius: 3,

  pointRadiusMinPixels: 2,
  pointRadiusMaxPixels: 4
});

const lineStyles = new Style({
  getLineColor: [76, 200, 163],

  lineWidthMinPixels: 1
});

const polygonStyles = new Style({
  stroked: true,
  filled: true,

  getFillColor: [130, 109, 186, 255],
  getLineColor: [44, 44, 44],
  getLineWidth: 1,

  lineWidthMinPixels: 1
});

const defaultStyles: Record<string, Style> = {
  Point: pointStyles,
  MultiPoint: pointStyles,

  LineString: lineStyles,
  MultiLineString: lineStyles,

  Polygon: polygonStyles,
  MultiPolygon: polygonStyles
};

export default defaultStyles;
