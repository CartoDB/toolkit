import {
  Source,
  SourceProps,
  SourceMetadata,
  Field
} from './Source';

import { sourceErrorTypes, SourceError } from '../errors/source-error';
import { GeoJsonObject } from './GeoJsonTypes';
import uuidv4 from 'uuid/v4'; // TODO: get it from core utils

interface GeoJsonSourceProps extends SourceProps {
  data: GeoJsonObject;
}

export class GeoJsonSource extends Source {
  private _geojson: GeoJsonObject;
  private _metadata?: SourceMetadata;
  private _props?: GeoJsonSourceProps;

  constructor(geojson: GeoJsonObject) {
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
    return Promise.resolve(true)
  }

  private _buildMetadata(fields?: Field[]) {
    return { geometryType, stats: fieldStats }
  }
}
