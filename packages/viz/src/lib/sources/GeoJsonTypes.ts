/**
 * Based on https://tools.ietf.org/html/rfc7946
 */

import { GeometryType } from './Source';

type GeoJsonGeometryType =
  'Point' |
  'MultiPoint' |
  'LineString' |
  'MultiLineString' |
  'Polygon' |
  'MultiPolygon';

type BBox = [number, number, number, number];
type Coordinates = number[];

interface GeoJsonObject {
  type: GeoJsonGeometryType | 'Feature' | 'FeatureCollection' | 'GeometryCollection';
  bbox?: BBox;
}

interface Feature extends GeoJsonObject {
  type: 'Feature';
  geometry: Geometry;
  properties?: { [name: string]: any } | null;
}

interface FeatureCollection extends GeoJsonObject {
  type: 'FeatureCollection';
  features: Array<Geometry>;
}

interface Point extends GeoJsonObject {
  type: 'Point';
  coordinates: Coordinates;
}

interface MultiPoint extends GeoJsonObject {
  type: 'MultiPoint';
  coordinates: Coordinates[];
}

interface LineString extends GeoJsonObject {
  type: 'LineString';
  coordinates: Coordinates[];
}

interface MultiLineString extends GeoJsonObject {
  type: 'MultiLineString';
  coordinates: Coordinates[][];
}

interface Polygon extends GeoJsonObject {
  type: 'Polygon';
  coordinates: Coordinates[][];
}

interface MultiPolygon extends GeoJsonObject {
  type: 'MultiPolygon';
  coordinates: Coordinates[][][];
}

interface GeometryCollection extends GeoJsonObject {
  type: 'GeometryCollection';
  geometries: Geometry[];
}

type Geometry = Point | MultiPoint | LineString | MultiLineString | Polygon | MultiPolygon;
export type GeoJSON = FeatureCollection | Feature | Geometry | GeometryCollection;

export function parseGeometryType (geoJsonGeometryType: GeoJsonGeometryType): GeometryType {
  if (['Point', 'MultiPoint'].includes(geoJsonGeometryType)) {
    return 'Point'
  }

  if (['LineString', 'MultiLineString'].includes(geoJsonGeometryType)) {
    return 'Line'
  }

  return 'Polygon'
}
