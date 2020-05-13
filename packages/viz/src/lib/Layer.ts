import { Deck } from '@deck.gl/core';
import { MVTLayer } from '@deck.gl/geo-layers';
import { Source } from './sources/Source';
import { CARTOSource, DOSource } from './sources';
import { DOLayer } from './deck/DOLayer';
import { getStyles, StyleProperties, Style } from './style';
import { Popup, PopupElement } from './popups/Popup';
import { StyledLayer } from './style/layer-style';
import { CartoLayerError, layerErrorTypes } from './errors/layer-error';

export class Layer implements StyledLayer {
  private _source: Source;
  private _style: Style;
  private _options: LayerOptions = {};

  // Deck.gl Map instance
  private _deckInstance: Deck | undefined;

  // Instance to the DeckLayer of the instance
  // It cannot be a reference to (import { Layer } from '@deck.gl/core') because
  // the typing of getPickinfo method is different from TileLayer and Layer are
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _deckLayer?: any;

  private _clickPopup?: Popup;
  private _hoverPopup?: Popup;

  constructor(
    source: string | Source,
    style: Style | StyleProperties = {},
    options: LayerOptions = {}
  ) {
    this._source = buildSource(source);
    this._style = buildStyle(style);

    this._options = {
      id: `${this._source.id}-${Date.now()}`,
      ...options
    };
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
    this._source = buildSource(source);

    if (this._deckLayer) {
      await this._replaceLayer();
    }
  }

  /**
   * Change the styles of the current layer.
   * A new map instantion and a replace of the layer will be fired
   * @param style style to be set
   */
  public async setStyle(style: {}) {
    this._style = buildStyle(style);

    if (this._deckLayer) {
      await this._replaceLayer();
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
  }

  /**
   * Method to create the Deck.gl layer
   */
  public async _createDeckGLLayer() {
    // The first step is to initialize the source to get the geometryType and the stats
    const styleField =
      this._style && this._style.field ? [this._style.field] : undefined;

    if (!this._source.isInitialized) {
      await this._source.init(styleField);
    }

    const layerProperties = await this._getLayerProperties();

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

  private async _getLayerProperties() {
    const metadata = this._source.getMetadata();
    const styleProps = this._style.getLayerProps(this);
    const props = this._source.getProps();

    return {
      ...this._options,
      ...props,
      ...getStyles(metadata.geometryType),
      ...styleProps
    };
  }

  /**
   * Replace a layer source
   */
  private async _replaceLayer() {
    if (this._deckInstance === undefined) {
      throw new Error('Undefined Deck.GL instance');
    }

    const deckLayers = this._deckInstance.props.layers.filter(
      (layer: { id: string }) => layer.id !== this._options.id
    );
    const newLayer = await this._createDeckGLLayer();

    this._deckInstance.setProps({
      layers: [...deckLayers, newLayer]
    });
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

  /**
   * @public
   * This method creates popups every time the
   * user clicks on one or more features of the layer.
   */
  public async setPopupClick(elements: PopupElement[] | string[] | null = []) {
    if (elements && elements.length > 0) {
      if (!this._clickPopup) {
        this._clickPopup = new Popup();

        if (this._deckInstance) {
          this._clickPopup.addTo(this._deckInstance);
        }
      }

      const clickHandler = this._clickPopup.createHandler(elements);
      this._options.onClick = clickHandler;
      this._options.pickable = true;
    } else {
      if (this._clickPopup) {
        this._clickPopup.close();
      }

      this._options.onClick = undefined;
    }

    if (this._deckLayer) {
      await this._replaceLayer();
    }
  }

  public async setPopupHover(elements: PopupElement[] | string[] | null = []) {
    if (elements && elements.length > 0) {
      if (!this._hoverPopup) {
        this._hoverPopup = new Popup({ closeButton: false });

        if (this._deckInstance) {
          this._hoverPopup.addTo(this._deckInstance);
        }
      }

      const hoverHandler = this._hoverPopup.createHandler(elements);
      this._options.onHover = hoverHandler;
      this._options.pickable = true;
    } else {
      if (this._hoverPopup) {
        this._hoverPopup.close();
      }

      this._options.onHover = undefined;
    }

    if (this._deckLayer) {
      await this._replaceLayer();
    }
  }

  public remove() {
    if (this._deckInstance === undefined) {
      throw new CartoLayerError(
        'Cannot remove because it was not attached to map',
        layerErrorTypes.DECK_MAP_NOT_INSTANTIATED
      );
    }

    const deckLayers = this._deckInstance.props.layers.filter(
      (layer: { id: string }) => layer.id !== this._options.id
    );

    this._deckInstance.setProps({
      layers: deckLayers
    });
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

  /**
   * This callback will be called when the mouse
   * clicks over an object of this layer.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (info: any, event: any) => void;

  /**
   * This callback will be called when the mouse enters/leaves
   * an object of this layer.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onHover?: (info: any, event: any) => void;

  /**
   * Whether the layer responds to mouse pointer picking events.
   */
  pickable?: boolean;
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
