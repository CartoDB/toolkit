import { Credentials, defaultCredentials } from '@carto/toolkit-core';
import { MapInstance, MapOptions, Maps } from '@carto/toolkit-maps';
import { Source, LayerProps, FieldStats } from './Source';

export interface SourceOptions {
  credentials?: Credentials;
  mapOptions?: MapOptions;
}

const defaultMapOptions: MapOptions = {
  vectorExtent: 2048,
  vectorSimplifyExtent: 2048,
  metadata: {
    geometryType: true
  }
};

function getSourceType(source: string) {
  const containsSpace = source.search(' ') > -1;
  return containsSpace ? 'sql' : 'dataset';
}

interface CARTOLayerProps extends LayerProps {
  // Tile URL template. It should be in the format of https://server/{z}/{x}/{y}..
  data: string | Array<string>;
}

/**
 * Implementation of a Source compatible with CARTO's MAPs API
 * * */
export class CARTOSource extends Source {
  // type of the source.
  private _type: 'sql' | 'dataset';
  // value it should be a dataset name or a SQL query
  private _value: string;

  // Internal credentials of the user
  private _credentials: Credentials;

  private _layerProps?: CARTOLayerProps;

  private _fieldStats?: FieldStats;

  private _mapConfig: MapOptions;

  private _isMapInstantiate: boolean;

  constructor(source: string, options: SourceOptions = {}) {
    const { mapOptions = {}, credentials = defaultCredentials } = options;

    // set layer id
    const id = `CARTO-${source}`;

    // call to super class
    super(id);

    // Set object properties
    this._type = getSourceType(source);
    this._value = source;
    this._credentials = credentials;
    this._isMapInstantiate = false;

    const sourceOpts = { [this._type]: source };

    // Set Map Config
    this._mapConfig = Object.assign(defaultMapOptions, mapOptions, sourceOpts);
  }

  /**
   * This methods returns the layer props of the TileLayer.
   * It returns the props of the source:
   *   - URL of the tiles provided by MAPs API
   *   - geometryType
   */
  public async getLayerProps(): Promise<CARTOLayerProps> {
    if (!this._isMapInstantiate) {
      await this._instantiateMap();
    }

    if (this._layerProps === undefined) {
      throw new Error('Props are not set after map instantiation');
    }

    return this._layerProps;
  }

  public get value(): string {
    return this._value;
  }

  public get type(): 'sql' | 'dataset' {
    return this._type;
  }

  public get credentials(): Credentials {
    return this._credentials;
  }

  public async getFieldStats(field: string): Promise<FieldStats> {
    // initialize the stats to 0

    if (!this._isMapInstantiate) {
      this._fieldStats = {
        name: field,
        min: 0,
        avg: 0,
        max: 0,
        sum: 0,
        sample: []
      };

      if (this._mapConfig.metadata === undefined) {
        throw new Error('Map Config has not metadata fiedl');
      }

      // Modify mapConfig to add the field stats
      this._mapConfig.metadata.columnStats = {
        topCategories: 32768,
        includeNulls: true
      };
      this._mapConfig.metadata.dimensions = true;

      /* eslint-disable @typescript-eslint/camelcase */
      this._mapConfig.metadata.sample = {
        num_rows: 1000,
        include_columns: [field]
      };
      /* eslint-enable @typescript-eslint/camelcase */

      this._mapConfig.aggregation = {
        columns: {},
        dimensions: {
          [field]: { column: field }
        },
        placement: 'centroid',
        resolution: 1,
        threshold: 1
      };

      await this._instantiateMap();
    }

    if (this._fieldStats === undefined) {
      throw new Error('Stats are not set after map instantiation');
    }

    return this._fieldStats;
  }

  private async _instantiateMap() {
    if (this._isMapInstantiate) {
      // Maybe this is too hard, but I'd like to keep to check it's not a performance issue. We could move it to just a warning
      throw new Error('Try to reinstantiate map multiple times');
    }

    const mapsClient = new Maps(this._credentials);

    const mapInstance: MapInstance = await mapsClient.instantiateMapFrom(
      this._mapConfig
    );

    this._isMapInstantiate = true;

    const urlData = mapInstance.metadata.url.vector;
    const urlTemplate = urlData.subdomains.map((subdomain: string) =>
      urlData.urlTemplate.replace('{s}', subdomain)
    );

    const { stats } = mapInstance.metadata.layers[0].meta;

    const geometryType = stats.geometryType.split('ST_')[1];

    this._layerProps = { data: urlTemplate, geometryType };

    if (this._fieldStats !== undefined) {
      this._fieldStats = {
        ...stats.columns[this._fieldStats.name],
        sample: stats.sample
      };
    }
  }
}
