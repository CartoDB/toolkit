/**
 * GeoJson types
 * https://tools.ietf.org/html/rfc7946#section-1.4
 */
export type GeoJsonTypes = [
  'Feature',
  'FeatureCollection',
  'Point',
  'MultiPoint',
  'LineString',
  'MultiLineString',
  'Polygon',
  'MultiPolygon',
  'GeometryCollection'
];

/**
 * GeoJson types
 * https://tools.ietf.org/html/rfc7946#section-1.4
 */
export type GeometryTypes = [
  'Point',
  'MultiPoint',
  'LineString',
  'MultiLineString',
  'Polygon',
  'MultiPolygon',
  'GeometryCollection'
];

/**
 * Bounding box
 * https://tools.ietf.org/html/rfc7946#section-5
 */
export type BBox = [number, number, number, number];

/**
 * GeoJson
 * https://tools.ietf.org/html/rfc7946#section-3
 */
export interface GeoJsonObject {
  type: GeoJsonTypes;
  bbox?: BBox;
}
