import { Credentials, defaultCredentials } from '@carto/toolkit-core';
import { MapOptions, Maps } from '@carto/toolkit-maps';
import { MVTTileLayer } from '@deck.gl/geo-layers';

import Source from './Source';

const defaultMapOptions: MapOptions = {
  vector_extent: 2048,
  vector_simplify_extent: 2048
};

export class Layer {
  private _mapsClientInstance: Maps;
  private _credentials: Credentials;

  private _layerSource: Source;
  private _layerOptions: MapOptions;
  private _layerInstantiation: Promise<any>; // TODO: Change to a proper definition

  constructor(source: string, options: LayerOptions = {}) {
    const { mapOptions, credentials = defaultCredentials } = options;

    this._credentials = credentials;
    this._mapsClientInstance = new Maps(this._credentials);

    this._layerSource = new Source(source);
    this._layerOptions = Object.assign({}, defaultMapOptions, mapOptions);
    this._layerInstantiation = this._mapsClientInstance.instantiateMapFrom(
      buildInstantiationOptions({ mapOptions: this._layerOptions, mapSource: this._layerSource })
    );
  }

  public async getDeckGLLayer(layerProps: { layerType?: any } = {}) {
    // TODO: Parse through Babel
    const { layerType: sublayerType, ...overridenStyleProps} = layerProps;
    const { urlTemplates } = await this._layerInstantiation.then(this._parseInstantiationResult);

    const defaultLayerProps = {
      getLineColor: [192, 0, 0],
      getFillColor: [200, 120, 80],
      lineWidthMinPixels: 1,
      pointRadiusMinPixels: 5,
      urlTemplates,
      uniquePropertyName: 'cartodb_id'
    };

    const layerProperties = Object.assign({}, defaultLayerProps, overridenStyleProps);
    return new MVTTileLayer(layerProperties);
  }

  private _parseInstantiationResult(instantiationData: any) {
    const urlData = instantiationData.metadata.url.vector;

    const urlTemplates = urlData.subdomains.map(
      (subdomain: string) => urlData.urlTemplate.replace('{s}', subdomain)
    );

    return { urlTemplates };
  }
}

function buildInstantiationOptions(
  { mapOptions, mapSource }: { mapOptions: MapOptions, mapSource: Source}
) {
  return {
    ...mapOptions,
    ...mapSource.getSourceOptions()
  };
}

interface LayerOptions {
  credentials?: Credentials;
  mapOptions?: MapOptions;
}
