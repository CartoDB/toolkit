import { Vector3 } from 'math.gl';
import { CartoError } from '@carto/toolkit-core';
import { GeometryTypes, GeometryData, ViewportFrustumPlanes } from './types';

export function checkIfGeometryIsInsideFrustum(
  geometry: GeometryData,
  frustumPlanes: ViewportFrustumPlanes
) {
  const checkFunction = checkGeometryFunctions[geometry.type as GeometryTypes];

  if (!checkFunction) {
    throw new CartoError({
      type: 'ViewportFeatures',
      message: `Check if ${geometry.type} feature is in viewport is not implemented`
    });
  }

  return checkFunction(geometry.coordinates, frustumPlanes);
}

const checkGeometryFunctions: Record<GeometryTypes, Function> = {
  [GeometryTypes.Point](
    coordinates: GeoJSON.Position,
    frustumPlanes: ViewportFrustumPlanes
  ) {
    return checkIfCoordinatesAreInsideFrustum(coordinates, frustumPlanes);
  },

  [GeometryTypes.MultiPoint](
    coordinates: GeoJSON.Position[],
    frustumPlanes: ViewportFrustumPlanes
  ) {
    return coordinates.map(coordinatePairs =>
      checkIfCoordinatesAreInsideFrustum(coordinatePairs, frustumPlanes)
    );
  },

  [GeometryTypes.LineString](
    coordinates: GeoJSON.Position[],
    frustumPlanes: ViewportFrustumPlanes
  ) {
    return coordinates.map(coordinatePairs =>
      checkIfCoordinatesAreInsideFrustum(coordinatePairs, frustumPlanes)
    );
  },

  [GeometryTypes.MultiLineString](
    lines: GeoJSON.Position[][],
    frustumPlanes: ViewportFrustumPlanes
  ) {
    return lines.map(line =>
      checkGeometryFunctions.LineString(line, frustumPlanes)
    );
  },

  [GeometryTypes.Polygon](
    polygonRings: GeoJSON.Position[][],
    frustumPlanes: ViewportFrustumPlanes
  ) {
    return polygonRings.some(polygon =>
      polygon.some(coordinatePairs =>
        checkIfCoordinatesAreInsideFrustum(coordinatePairs, frustumPlanes)
      )
    );
  },

  [GeometryTypes.MultiPolygon](
    polygons: GeoJSON.Position[][][],
    frustumPlanes: ViewportFrustumPlanes
  ) {
    return polygons.some(polygon =>
      checkGeometryFunctions.Polygon(polygon, frustumPlanes)
    );
  }
};

export function checkIfCoordinatesAreInsideFrustum(
  coordinates: GeoJSON.Position,
  frustumPlanes: ViewportFrustumPlanes
) {
  const featureCoordinates = new Vector3(coordinates[0], coordinates[1], 0);

  return Object.keys(frustumPlanes).every(plane => {
    const { normal, distance } = frustumPlanes[plane];
    return normal.dot(featureCoordinates) < distance;
  });
}
