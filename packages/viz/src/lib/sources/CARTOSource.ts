import { Credentials, defaultCredentials } from '@carto/toolkit-core';
import { MapInstance, MapOptions, Maps } from '@carto/toolkit-maps';
import { Source, SourceProps, SourceMetadata } from './Source';
import { NumericFieldStats, CategoryFieldStats } from '../global-interfaces';
import { parseGeometryType } from '../style/helpers/utils';
import { sourceErrorTypes, SourceError } from '../errors/source-error';

export interface SourceOptions {
  credentials?: Credentials;
  mapOptions?: MapOptions;
}

const defaultMapOptions: MapOptions = {
  vectorExtent: 2048,
  vectorSimplifyExtent: 2048,
  bufferSize: {
    mvt: 10
  },
  metadata: {
    geometryType: true
  }
};

function getSourceType(source: string) {
  const containsSpace = source.search(' ') > -1;
  return containsSpace ? 'sql' : 'dataset';
}

interface CARTOSourceProps extends SourceProps {
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

  private _props?: CARTOSourceProps;

  private _mapConfig: MapOptions;

  private _metadata?: SourceMetadata;

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
    const sourceOpts = { [this._type]: source };

    // Set Map Config
    this._mapConfig = Object.assign(defaultMapOptions, mapOptions, sourceOpts);
  }

  /**
   * It returns the props of the source:
   *   - URL of the tiles provided by MAPs API
   *   - geometryType
   */
  public getProps(): CARTOSourceProps {
    if (!this.isInitialized) {
      throw new SourceError(
        'getProps requires init call',
        sourceErrorTypes.INIT_SKIPPED
      );
    }

    if (this._props === undefined) {
      throw new SourceError('Props are not set after map instantiation');
    }

    return this._props;
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

  public getMetadata(): SourceMetadata {
    // initialize the stats to 0

    if (!this.isInitialized) {
      throw new SourceError(
        'GetMetadata requires init call',
        sourceErrorTypes.INIT_SKIPPED
      );
    }

    if (this._metadata === undefined) {
      throw new SourceError('Metadata are not set after map instantiation');
    }

    return this._metadata;
  }

  private _initConfigForStats(fields: string[]) {
    if (this._mapConfig.metadata === undefined) {
      throw new SourceError('Map Config has not metadata field');
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
      include_columns: fields
    };
    /* eslint-enable @typescript-eslint/camelcase */

    const dimensions: Record<string, { column: string }> = {};
    fields.forEach(field => {
      dimensions[field] = { column: field };
    });

    this._mapConfig.aggregation = {
      columns: {},
      dimensions,
      placement: 'centroid',
      resolution: 1,
      threshold: 1
    };
  }

  public async init(fieldsStats?: string[]): Promise<boolean> {
    if (this.isInitialized) {
      // Maybe this is too hard, but I'd like to keep to check it's not a performance issue. We could move it to just a warning
      throw new SourceError('Try to reinstantiate map multiple times');
    }

    const mapsClient = new Maps(this._credentials);

    if (fieldsStats) {
      this._initConfigForStats(fieldsStats);
    }

    const mapInstance: MapInstance = await mapsClient.instantiateMapFrom(
      this._mapConfig
    );

    const urlData = mapInstance.metadata.url.vector;
    const urlTemplate = urlData.subdomains.map((subdomain: string) =>
      urlData.urlTemplate.replace('{s}', subdomain)
    );

    const { stats } = mapInstance.metadata.layers[0].meta;

    const geometryType = parseGeometryType(stats.geometryType);

    this._props = { type: 'TileLayer', data: urlTemplate };

    const fieldStats: (NumericFieldStats | CategoryFieldStats)[] = [];

    if (fieldsStats !== undefined) {
      fieldsStats.forEach(field => {
        const columnStats = stats.columns[field];

        switch (columnStats.type) {
          case 'string':
            fieldStats.push({
              name: field,
              categories: columnStats.categories
            });
            break;
          case 'number':
            fieldStats.push({
              name: field,
              ...stats.columns[field],
              sample: stats.sample.map((x: any) => x[field])
            });
            break;
          default:
            throw new SourceError(
              'Unsupported type for stats',
              sourceErrorTypes.UNSUPPORTED_STATS_TYPE
            );
        }
      });
    }

    this._metadata = { geometryType, stats: fieldStats };

    this.isInitialized = true;
    return this.isInitialized;
  }
}
