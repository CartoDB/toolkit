import { Credentials, defaultCredentials } from '@carto/toolkit-core';
import { MapInstance, MapOptions, Maps } from '@carto/toolkit-maps';
// eslint-disable-next-line import/no-unresolved
import { MVTLayer } from '@deck.gl/geo-layers';

import Source from './Source';
import { defaultStyles, Style } from './style';

const defaultMapOptions: MapOptions = {
  vectorExtent: 2048,
  vectorSimplifyExtent: 2048,
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
  private _layerInstantiation: Promise<MapInstance>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _deckInstance: any;
  private _mvtLayerInstance: MVTLayer<string> | undefined;

  constructor(source: string, styles = {}, options: LayerOptions = {}) {
    const { mapOptions = {}, credentials = defaultCredentials } = options;

    this._credentials = credentials;
    this._mapsClientInstance = new Maps(this._credentials);

    this._layerSource = new Source(source);
    this._layerStyles = new Style(styles);

    this._layerOptions = { ...defaultMapOptions, ...mapOptions };
    this._layerInstantiation = this._mapsClientInstance.instantiateMapFrom(
      buildInstantiationOptions({
        mapOptions: this._layerOptions,
        mapSource: this._layerSource
      })
    );
  }

  public async setSource(source: string) {
    const previousSource = this._layerSource;

    this._layerSource = new Source(source);
    this._layerInstantiation = this._mapsClientInstance.instantiateMapFrom(
      buildInstantiationOptions({
        mapOptions: this._layerOptions,
        mapSource: this._layerSource
      })
    );

    if (this._mvtLayerInstance) {
      await this._replaceLayer(previousSource);
    }
  }

  public async setStyle(style: {}) {
    const previousSource = this._layerSource;

    this._layerStyles = new Style(style);

    if (this._mvtLayerInstance) {
      await this._replaceLayer(previousSource);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async addTo(deckInstance: any) {
    const currentDeckLayers = deckInstance.props.layers;
    const createdDeckLayer = await this.getDeckGLLayer();

    deckInstance.setProps({
      layers: [...currentDeckLayers, createdDeckLayer]
    });

    this._deckInstance = deckInstance;
  }

  public async getDeckGLLayer() {
    const layerProperties = await this._getDeckGLLayerProperties();

    this._mvtLayerInstance = new MVTLayer(layerProperties);
    return this._mvtLayerInstance;
  }

  private async _getDeckGLLayerProperties() {
    const {
      urlTemplates: data,
      geometryType
    } = await this._layerInstantiation.then(parseInstantiationResult);

    const defaultGeometryStyles = defaultStyles[geometryType];
    const layerId = generateLayerId(this._layerSource.getSourceValue());

    return {
      ...{ data, id: layerId },
      ...defaultGeometryStyles.getProperties(),
      ...this._layerStyles.getProperties()
    };
  }

  private async _replaceLayer(previousLayerSource: Source) {
    const newLayer = await this.getDeckGLLayer();
    const previousLayerId = generateLayerId(
      previousLayerSource.getSourceValue()
    );

    const deckLayers = this._deckInstance.props.layers.filter(
      (layer: MVTLayer<string>) => layer.id !== previousLayerId
    );

    this._deckInstance.setProps({
      layers: [...deckLayers, newLayer]
    });
  }

  public get credentials() {
    return this._credentials;
  }
}

function buildInstantiationOptions({
  mapOptions,
  mapSource
}: {
  mapOptions: MapOptions;
  mapSource: Source;
}) {
  return {
    ...mapOptions,
    ...mapSource.getSourceOptions()
  };
}

function generateLayerId(layerSource: string) {
  return `MVTLayer-${layerSource}`;
}

function parseInstantiationResult(instantiationData: MapInstance) {
  const { metadata } = instantiationData;

  const urlData = metadata.url.vector;
  const urlTemplates = urlData.subdomains.map((subdomain: string) =>
    urlData.urlTemplate.replace('{s}', subdomain)
  );

  const geometryType = metadata.layers[0].meta.stats.geometryType.split(
    'ST_'
  )[1];

  return { urlTemplates, geometryType };
}

interface LayerOptions {
  credentials?: Credentials;
  mapOptions?: MapOptions;
}
