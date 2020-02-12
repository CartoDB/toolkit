import { Credentials } from '@carto/toolkit-core';
import { Maps } from '@carto/toolkit-maps';
import { GeoJsonLayer, MVTTileLayer } from '@deck.gl/layers';

import Source from './Source';

const defaultMapOptions: MapOptions = {
  vector_extent: 2048,
  vector_simplify_extent: 2048
};

class CartoTileLayer {
  private _mapsClientInstance: Maps;
  private _credentials: Credentials;

  private _mapSource: Source;
  private _mapOptions: MapOptions;
  private _mapInstantiation: Promise<any>; // TODO: Change to a proper definition

  constructor(source: string, options: LayerOptions = {}) {
    const { mapOptions, credentials = new Credentials('jbotella', 'default_public') } = options;

    this._credentials = credentials;
    this._mapsClientInstance = new Maps(this._credentials);
    this._mapSource = new Source(source);

    // Map Instantiation
    this._mapOptions = Object.assign({}, defaultMapOptions, mapOptions);
    this._mapInstantiation = this._mapsClientInstance.instantiateMapFrom(
      buildInstantiationOptions({ mapOptions: this._mapOptions, mapSource: this._mapSource })
    );
  }

  public async buildDeckGLLayer(layerProps: { layerType?: any} = {}) {
    // TODO: Parse through Babel
    const { layerType: sublayerType, ...styleProps} = layerProps;
    const deckSublayer = sublayerType || GeoJsonLayer;

    const { urlTemplates } = await this._mapInstantiation.then(this._parseInstantiationResult);

    const layerProperties = Object.assign({}, styleProps, {
      getLineColor: [192, 0, 0],
      getFillColor: [200, 120, 80],
      lineWidthMinPixels: 1,
      pointRadiusMinPixels: 5,
      urlTemplates,
      uniquePropertyName: 'cartodb_id',
      renderSubLayers: (props: any) => new deckSublayer({ ...props })
    });

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

interface MapOptions {
  vector_extent: number;
  vector_simplify_extent: number;
}

export default CartoTileLayer;
