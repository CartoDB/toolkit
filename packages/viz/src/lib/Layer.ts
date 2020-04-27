import { MVTLayer } from '@deck.gl/geo-layers';
import { Source } from './sources/Source';
import { CARTOSource } from './sources/CARTOSource';
import { DataObservatorySource } from './sources/DataObservatorySource';
import { DataObservatoryLayer } from './deck/DataObservatoryLayer';

import { defaultStyles, Style } from './style';

export class Layer {
  private _source: Source;
  private _styles: Style;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _deckInstance: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _deckLayer: any;

  constructor(
    source: string | CARTOSource | DataObservatorySource,
    styles = {}
  ) {
    this._source = buildSource(source);
    this._styles = new Style(styles);
  }

  /**
   * Change a source to the current layer.
   * A new map instantion and a replace of the layer will be fired
   * @param source source to be set
   */
  public async setSource(source: string | CARTOSource | DataObservatorySource) {
    const previousSource = this._source;

    this._source = buildSource(source);

    if (this._deckInstance) {
      await this._replaceLayer(previousSource);
    }
  }

  /**
   * Change the styles of the current layer.
   * A new map instantion and a replace of the layer will be fired
   * @param style style to be set
   */
  public async setStyle(style: {}) {
    const previousSource = this._source;

    this._styles = new Style(style);

    if (this._deckLayer) {
      await this._replaceLayer(previousSource);
    }
  }

  /**
   * Add the current layer to a Deck instance
   * @param deckInstance instance to add the layer to
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async addTo(deckInstance: any) {
    // get current layers
    const currentDeckLayers = deckInstance.props.layers;
    // create the new layer
    const layer = await this._createDeckGLLayer();

    deckInstance.setProps({
      layers: [...currentDeckLayers, layer]
    });

    this._deckInstance = deckInstance;
  }

  /**
   * Method to create the Deck.gl layer
   */
  private async _createDeckGLLayer() {
    // Get the blueprint of the layer
    const blueprint = await this._source.blueprint();

    const layerProperties = Object.assign(
      blueprint,
      defaultStyles[blueprint.geometryType].getProperties(),
      this._styles.getProperties()
    );

    // Create the Deck.gl instance
    if (this._source instanceof CARTOSource) {
      this._deckLayer = new MVTLayer(layerProperties);
    } else if (this._source instanceof DataObservatorySource) {
      this._deckLayer = new DataObservatoryLayer(layerProperties);
    } else {
      throw Error('Unsupported source instance');
    }

    return this._deckLayer;
  }

  /**
   * Replace a layer source
   * @param previousSource source of the layer to be replaced
   */
  private async _replaceLayer(previousSource: Source) {
    const newLayer = await this._createDeckGLLayer();

    const deckLayers = this._deckInstance.props.layers.filter(
      (layer: any) => layer.id !== previousSource.id
    );

    this._deckInstance.setProps({
      layers: [...deckLayers, newLayer]
    });
  }
}

/**
 * Internal function to auto convert string to CARTO source
 * @param source source object to be converted
 */
function buildSource(source: string | CARTOSource | DataObservatorySource) {
  return typeof source === 'string' ? new CARTOSource(source) : source;
}
