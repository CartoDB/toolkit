import { MVTLayer } from '@deck.gl/geo-layers';
import { Deck } from '@deck.gl/core';
import { CartoError } from '@carto/toolkit-core';
import { Source } from './sources/Source';
import { CARTOSource, DOSource } from './sources';
import { DOLayer } from './deck/DOLayer';
import { StyleProperties, Style, defaultStyles } from './style';
import { StyledLayer } from './style/layer-style';
import {
  ViewportFeaturesGenerator,
  ViewportFeaturesOptions
} from './interactivity/viewport-features/ViewportFeaturesGenerator';

export class Layer implements StyledLayer {
  private _source: Source;
  private _style?: Style;

  // Deck.gl Map instance
  private _deckInstance: Deck | undefined;

  // Instance to the DeckLayer of the instance
  // It cannot be a reference to (import { Layer } from '@deck.gl/core') because
  // the typing of getPickinfo method is different from TileLayer and Layer are
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _deckLayer?: any;

  // Viewport Features Generator instane to get current features within viewport
  private _viewportFeaturesGenerator = new ViewportFeaturesGenerator();

  public id: string;

  constructor(
    source: string | Source,
    style: Style | StyleProperties = {},
    options: LayerOptions = {}
  ) {
    this._source = buildSource(source);
    this._style = buildStyle(style);
    this.id = options.id || `${this._source.id}-${Date.now()}`;
  }

  getMapInstance(): Deck {
    if (this._deckInstance === undefined) {
      throw Error('Layer not attached to map');
    }

    return this._deckInstance;
  }

  /**
   * Change a source to the current layer.
   * A new map instantion and a replace of the layer will be fired
   * @param source source to be set
   */
  public async setSource(source: string | Source) {
    const previousSource = this._source;

    this._source = buildSource(source);

    if (this._deckLayer) {
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

    this._style = buildStyle(style);

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
    const currentDeckLayers = deckInstance.props.layers;
    const createdDeckGLLayer = await this._createDeckGLLayer();

    deckInstance.setProps({
      layers: [...currentDeckLayers, createdDeckGLLayer]
    });

    this._deckInstance = deckInstance;

    this._viewportFeaturesGenerator.setDeckInstance(deckInstance);
    this._viewportFeaturesGenerator.setDeckLayer(createdDeckGLLayer);
  }

  /**
   * Method to create the Deck.gl layer
   */
  public async _createDeckGLLayer() {
    // The first step is to initialize the source to get the geometryType and the stats
    const styleField =
      this._style && this._style.field ? [this._style.field] : undefined;

    await this._source.init(styleField);

    const metadata = this._source.getMetadata();

    const styleProps = this._style
      ? this._style.getLayerProps(this)
      : undefined;

    // Get properties of the layer
    const props = this._source.getProps();

    const layerProperties = {
      id: this.id,
      ...props,
      ...defaultStyles(metadata.geometryType),
      ...styleProps
    };

    // Create the Deck.gl instance
    if (this._source instanceof CARTOSource) {
      this._deckLayer = new MVTLayer(layerProperties);
    } else if (this._source instanceof DOSource) {
      this._deckLayer = new DOLayer(layerProperties);
    } else {
      throw Error('Unsupported source instance');
    }

    return this._deckLayer;
  }

  public getViewportFeatures(options: ViewportFeaturesOptions) {
    if (!this._viewportFeaturesGenerator.isReady()) {
      throw new CartoError({
        type: 'Layer',
        message:
          'Cannot retrieve viewport features because this layer has not been added to a map yet'
      });
    }

    return this._viewportFeaturesGenerator.getFeatures(options);
  }

  /**
   * Replace a layer source
   * @param previousSource source of the layer to be replaced
   */
  private async _replaceLayer(previousSource: Source) {
    const newLayer = await this._createDeckGLLayer();

    if (this._deckInstance === undefined) {
      throw new Error('Undefined Deck.GL instance');
    }

    const deckLayers = this._deckInstance.props.layers.filter(
      (layer: { id: string }) => layer.id !== previousSource.id
    );

    this._deckInstance.setProps({
      layers: [...deckLayers, newLayer]
    });

    this._viewportFeaturesGenerator.setDeckLayer(newLayer);
  }

  public async getDeckGLLayer() {
    if (this._deckLayer === undefined) {
      this._deckLayer = await this._createDeckGLLayer();
    }

    return this._deckLayer;
  }

  public get source() {
    return this._source;
  }
}

/**
 * Options of the layer
 */
interface LayerOptions {
  /**
   * id of the layer
   */
  id?: string;
}

/**
 * Internal function to auto convert string to CARTO source
 * @param source source object to be converted
 */
function buildSource(source: string | Source) {
  return typeof source === 'string' ? new CARTOSource(source) : source;
}

function buildStyle(style: Style | StyleProperties) {
  return style instanceof Style ? style : new Style(style);
}
