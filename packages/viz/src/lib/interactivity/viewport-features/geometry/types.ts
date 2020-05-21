import { Vector3 } from '@math.gl/core';

export enum GeometryTypes {
  Point = 'Point',
  MultiPoint = 'MultiPoint',
  LineString = 'LineString',
  MultiLineString = 'MultiLineString',
  Polygon = 'Polygon',
  MultiPolygon = 'MultiPolygon'
}

export type GeometryData =
  | GeoJSON.Point
  | GeoJSON.MultiPoint
  | GeoJSON.LineString
  | GeoJSON.MultiLineString
  | GeoJSON.Polygon
  | GeoJSON.MultiPolygon;

// TODO: This belongs to Deck.gl typings
export interface FrustumPlane {
  normal: Vector3;
  distance: number;
}
export type ViewportFrustumPlanes = Record<string, FrustumPlane>;
