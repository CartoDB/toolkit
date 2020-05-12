import { Matrix4 } from 'math.gl';
import { CartoError } from '@carto/toolkit-core';
import { GeometryTypes, GeometryData } from './types';

const WORLD_SIZE = 512;

export function transformGeometryCoordinatesToCommonSpace(
  geometry: GeometryData,
  matrix: Matrix4
) {
  const transformFunction = transformFunctions[geometry.type as GeometryTypes];

  if (!transformFunction) {
    throw new CartoError({
      type: 'ViewportFeatures',
      message: `Transformation to local coordinates from ${geometry.type} is not implemented`
    });
  }

  return {
    ...geometry,
    coordinates: transformFunction(geometry.coordinates, matrix)
  };
}

const transformFunctions: Record<string, Function> = {
  [GeometryTypes.Point](coordinates: GeoJSON.Position, matrix: Matrix4) {
    return matrix.transformPoint(coordinates, undefined);
  },

  [GeometryTypes.MultiPoint](points: GeoJSON.Position[], matrix: Matrix4) {
    return points.map(point => transformFunctions.Point(point, matrix));
  },

  [GeometryTypes.LineString](coordinates: GeoJSON.Position[], matrix: Matrix4) {
    return coordinates.map(coordinatePairs =>
      transformFunctions.Point(coordinatePairs, matrix)
    );
  },

  [GeometryTypes.MultiLineString](
    lines: GeoJSON.Position[][],
    matrix: Matrix4
  ) {
    return lines.map(line => transformFunctions.LineString(line, matrix));
  },

  [GeometryTypes.Polygon](coordinates: GeoJSON.Position[][], matrix: Matrix4) {
    return coordinates.map(polygonRingCoordinates =>
      transformFunctions.LineString(polygonRingCoordinates, matrix)
    );
  },

  [GeometryTypes.MultiPolygon](
    polygons: GeoJSON.Position[][][],
    matrix: Matrix4
  ) {
    return polygons.map(polygon => transformFunctions.Polygon(polygon, matrix));
  }
};

export function getTransformationMatrixFromTile(tile: {
  x: number;
  y: number;
  z: number;
}) {
  const worldScale = 2 ** tile.z;

  const xScale = WORLD_SIZE / worldScale;
  const yScale = -xScale;

  const xOffset = (WORLD_SIZE * tile.x) / worldScale;
  const yOffset = WORLD_SIZE * (1 - tile.y / worldScale);

  return new Matrix4()
    .translate([xOffset, yOffset, 0])
    .scale([xScale, yScale, 1]);
}
