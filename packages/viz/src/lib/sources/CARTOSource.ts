import { Credentials, defaultCredentials } from '@carto/toolkit-core';
import { MapInstance, MapOptions, Maps } from '@carto/toolkit-maps';
import { Source, LayerProps } from './Source';

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
  // Instantiation object
  private _mapInstantiation: Promise<MapInstance>;
  // Internal credentials of the user
  private _credentials: Credentials;

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

    // MAPS API instantiation
    const mapsClient = new Maps(this._credentials);
    const mapConfig = Object.assign(defaultMapOptions, mapOptions, sourceOpts);
    this._mapInstantiation = mapsClient.instantiateMapFrom(mapConfig);
  }

  /**
   * This methods returns the layer props of the TileLayer.
   * It returns the props of the source:
   *   - URL of the tiles provided by MAPs API
   *   - geometryType
   */
  public async getLayerProps(): Promise<CARTOLayerProps> {
    const instantiationData = await this._mapInstantiation;

    const { metadata } = instantiationData;

    const urlData = metadata.url.vector;
    const urlTemplate = urlData.subdomains.map((subdomain: string) =>
      urlData.urlTemplate.replace('{s}', subdomain)
    );

    const geometryType = metadata.layers[0].meta.stats.geometryType.split(
      'ST_'
    )[1];

    return { data: urlTemplate, geometryType };
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
}
