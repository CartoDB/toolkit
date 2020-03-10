import { Credentials, defaultCredentials } from '@carto/toolkit-core';
import { MapOptions, Maps } from '@carto/toolkit-maps';
import { MVTTileLayer } from '@deck.gl/geo-layers';

import Source from './Source';
import {defaultStyles, Style} from './style';

const defaultMapOptions: MapOptions = {
  vector_extent: 2048,
  vector_simplify_extent: 2048,
  metadata: {
    geometryType: true
  }
};

export class Layer {
  private _mapsClientInstance: Maps;
  private _credentials: Credentials;

  private _layerSource: Source;
  private _layerStyles: Style;
  private _layerOptions: MapOptions;
  private _layerInstantiation: Promise<any>; // TODO: Change to a proper definition

  constructor(source: string, styles = {}, options: LayerOptions = {}) {
    // TODO: Add property validation
    const { mapOptions, credentials = defaultCredentials } = options;

    this._credentials = credentials;
    this._mapsClientInstance = new Maps(this._credentials);

    this._layerSource = new Source(source);
    this._layerStyles = new Style(styles);

    this._layerOptions = Object.assign({}, defaultMapOptions, mapOptions);
    this._layerInstantiation = this._mapsClientInstance.instantiateMapFrom(
      buildInstantiationOptions({ mapOptions: this._layerOptions, mapSource: this._layerSource })
    );
  }

  public async addTo(deckInstance: any) {
    const currentDeckLayers = deckInstance.props.layers;
    const createdDeckLayer = await this.getDeckGLLayer();

    deckInstance.setProps({
      layers: [
        ...currentDeckLayers,
        createdDeckLayer
      ]
    });
  }

  public async getDeckGLLayer() {
    // TODO: Parse through Babel
    const {urlTemplates, geometryType} = await this._layerInstantiation.then(this._parseInstantiationResult);
    const defaultGeometryStyles = defaultStyles[geometryType];

    const layerProperties = Object.assign(
      { urlTemplates },
      defaultGeometryStyles.getProperties(),
      this._layerStyles.getProperties()
    );

    return new MVTTileLayer(layerProperties);
  }

  private _parseInstantiationResult(instantiationData: any) {
    const metadata = instantiationData.metadata;

    const urlData = metadata.url.vector;
    const urlTemplates = urlData.subdomains.map(
      (subdomain: string) => urlData.urlTemplate.replace('{s}', subdomain)
    );

    const geometryType = metadata.layers[0].meta.stats.geometryType.split('ST_')[1];

    return { urlTemplates, geometryType };
  }

  public get credentials() {
    return this._credentials;
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
