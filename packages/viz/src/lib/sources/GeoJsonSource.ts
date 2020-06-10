import {
  Source,
  SourceProps,
  SourceMetadata,
  NumericFieldStats,
  CategoryFieldStats,
  GeometryType,
  Field
} from './Source';

import { sourceErrorTypes, SourceError } from '../errors/source-error';
import { GeoJSON, GeoJsonGeometryTypes } from 'geojson'

import uuidv4 from 'uuid/v4'; // TODO: get it from core utils

interface GeoJsonSourceProps extends SourceProps {
  data: GeoJSON;
}

export const DEFAULT_GEOM = 'Point'

export class GeoJsonSource extends Source {
  private _geojson: GeoJSON;
  private _metadata?: SourceMetadata;
  private _props?: GeoJsonSourceProps;

  constructor(geojson: GeoJSON) {
    const id = `geojson-${uuidv4()}`;
    super(id);

    this._geojson = geojson;
  }

  public getProps(): GeoJsonSourceProps {
    if (!this.isInitialized || !this._props) {
      throw new SourceError(
        'getProps requires init call',
        sourceErrorTypes.INIT_SKIPPED
      );
    }

    return this._props;
  }

  public getMetadata(): SourceMetadata {
    if (!this.isInitialized || !this._metadata) {
      throw new SourceError(
        'GetMetadata requires init call',
        sourceErrorTypes.INIT_SKIPPED
      );
    }

    return this._metadata;
  }

  public async init(fields?: Field[]): Promise<boolean> {
    this._props = { type: 'GeoJsonLayer', data: this._geojson };
    this._metadata = this._buildMetadata(fields);
    this.isInitialized = true;
    return Promise.resolve(true);
  }

  private _buildMetadata(fields?: Field[]) {
    const geometryType = getGeomType(this._geojson);
    const stats = getStats(this._geojson, fields);

    return { geometryType, stats };
  }
}

export function getStats(geojson: GeoJSON, fields?: Field[]): (NumericFieldStats | CategoryFieldStats)[] {
  const stats: (NumericFieldStats | CategoryFieldStats)[] = [];
  return stats;
}

export function getGeomType(geojson: GeoJSON): GeometryType {
  if (geojson.type === 'Feature') {
    return parseGeometryType(geojson.geometry.type);
  }

  if (geojson.type === 'FeatureCollection') {
    return geojson.features.length ? getGeomType(geojson.features[0]) : DEFAULT_GEOM;
  }

  if (geojson.type === 'GeometryCollection') {
    return geojson.geometries.length ? parseGeometryType(geojson.geometries[0].type) : DEFAULT_GEOM
  }

  return parseGeometryType(geojson.type);
}

function parseGeometryType (geoJsonGeometryType: GeoJsonGeometryTypes): GeometryType {
  if (['Point', 'MultiPoint'].includes(geoJsonGeometryType)) {
    return 'Point'
  }

  if (['LineString', 'MultiLineString'].includes(geoJsonGeometryType)) {
    return 'Line'
  }

  return 'Polygon'
}
