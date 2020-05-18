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
  private _options: LayerOptions;

  // Deck.gl Map instance
  private _deckInstance: Deck | undefined;

  // Instance to the DeckLayer of the instance
  // It cannot be a reference to (import { Layer } from '@deck.gl/core') because
  // the typing of getPickinfo method is different from TileLayer and Layer are
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _deckLayer?: any;

  // interaction attributes
  private _clickPopup?: Popup;
  private _hoverPopup?: Popup;

  private _hoverFeature?: Record<string, any>;
  private _clickFeature?: Record<string, any>;

  private _hoverStyle?: Style;
  private _clickStyle?: Style;

  constructor(
    source: string | Source,
    style: Style | StyleProperties = {},
    options?: Partial<LayerOptions>
  ) {
    this._source = buildSource(source);
    this._style = buildStyle(style);

    this._options = {
      id: `${this._source.id}-${Date.now()}`,
      onHover: this._setStyleCursor.bind(this),
      ...options
    };

    if (this._options.hoverStyle) {
      this._hoverStyle = buildStyle(this._options.hoverStyle);
    }

    if (this._options.clickStyle) {
      this._clickStyle = buildStyle(this._options.clickStyle);
    }
  }

  getMapInstance(): Deck {
    if (this._deckInstance === undefined) {
      throw new CartoLayerError(
        'Cannot return map instance because the layer has not been added to a map yet',
        layerErrorTypes.DECK_MAP_NOT_FOUND
      );
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
  public async addTo(deckInstance: Deck) {
    const createdDeckGLLayer = await this._createDeckGLLayer();

    // collection may have changed during instantiation...
    const currentDeckLayers = deckInstance.props.layers;

    deckInstance.setProps({
      layers: [...currentDeckLayers, createdDeckGLLayer]
    });

    this._deckInstance = deckInstance;

    if (this._clickPopup) {
      this._clickPopup.addTo(this._deckInstance);
    }

    if (this._hoverPopup) {
      this._hoverPopup.addTo(this._deckInstance);
    }
  }

  /**
   * Attaches an event handler function defined by the user to
   * this layer.
   *
   * @param eventType - Event type
   * @param eventHandler - Event handler defined by the user
   */
  public async on(eventType: EventType, eventHandler?: InteractionHandler) {
    if (!eventHandler) {
      if (eventType === EventType.CLICK) {
        this._options.onClick = undefined;
      } else if (eventType === EventType.HOVER) {
        this._options.onHover = this._setStyleCursor.bind(this);
      }
    } else {
      const layerHandlerFn = (info: any, event: HammerInput) => {
        const features = [];
        const { coordinate, object } = info;

        if (object) {
          features.push(object);
        }

        if (eventType === EventType.CLICK) {
          this._clickFeature = object;
        } else if (eventType === EventType.HOVER) {
          this._hoverFeature = object;
          this._setStyleCursor(info);
        }

        if (this._options.clickStyle || this._options.hoverStyle) {
          const interactiveStyle = this._wrapInteractiveStyle();
          this.setStyle(interactiveStyle);
        }

        eventHandler.call(this, features, coordinate, event);
      };

      if (eventType === EventType.CLICK) {
        this._options.onClick = layerHandlerFn;
      } else if (eventType === EventType.HOVER) {
        this._options.onHover = layerHandlerFn;
      }

      this._options.pickable = true;
    }

    await this._replaceLayer();
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
      throw new CartoLayerError(
        'Unsupported source instance',
        layerErrorTypes.UNKNOWN_SOURCE
      );
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
    if (this._deckInstance) {
      const deckLayers = this._deckInstance.props.layers.filter(
        (layer: { id: string }) => layer.id !== this._options.id
      );
      const newLayer = await this._createDeckGLLayer();

      this._deckInstance.setProps({
        layers: [...deckLayers, newLayer]
      });
    }
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
    // if the popup was not created yet then we create it and add it to the map
    if (elements && elements.length > 0 && !this._clickPopup) {
      this._clickPopup = new Popup();

      if (this._deckInstance) {
        this._clickPopup.addTo(this._deckInstance);
      }
    }

    this._setPopupHandler(EventType.CLICK, elements);
  }

  public async setPopupHover(elements: PopupElement[] | string[] | null = []) {
    // if the popup was not created yet then we create it and add it to the map
    if (elements && elements.length > 0 && !this._hoverPopup) {
      this._hoverPopup = new Popup({ closeButton: false });

      if (this._deckInstance) {
        this._hoverPopup.addTo(this._deckInstance);
      }
    }

    this._setPopupHandler(EventType.HOVER, elements);
  }

  private async _setPopupHandler(
    eventType: EventType,
    elements: PopupElement[] | string[] | null = []
  ) {
    const popup =
      eventType === EventType.CLICK ? this._clickPopup : this._hoverPopup;

    if (elements && elements.length > 0) {
      if (popup) {
        this.on(eventType, popup.createHandler(elements));
      }
    } else {
      if (popup) {
        popup.close();
      }

      this.on(eventType, undefined);
    }

    if (this._deckLayer) {
      await this._replaceLayer();
    }
  }

  /**
   * Handler for set the style cursor if is
   * hover a feature.
   *
   * @param info - picked info from the layer
   */
  private _setStyleCursor(info: any) {
    if (this._deckInstance) {
      const { object } = info;
      this._deckInstance.setProps({
        ...this._deckInstance.props,
        getCursor: () => (object ? 'pointer' : 'grab')
      });
    }
  }

  /**
   * Wraps the style defined by the user with new functions
   * to check if the feature received by paramter has been clicked
   * or hovered by the user in order to apply the interaction style
   */
  private _wrapInteractiveStyle() {
    const wrapInteractiveStyle = { updateTriggers: {} };

    const styleProps = this._style.getLayerProps(this);

    let clickStyleProps = {};

    if (this._clickStyle) {
      clickStyleProps = this._clickStyle.getLayerProps(this);
    }

    let hoverStyleProps = {};

    if (this._hoverStyle) {
      hoverStyleProps = this._hoverStyle.getLayerProps(this);
    }

    Object.keys({
      ...clickStyleProps,
      ...hoverStyleProps
    }).forEach(styleProp => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const defaultStyleValue = styleProps[styleProp];
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const hoverStyleValue = hoverStyleProps[styleProp];
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const clickStyleValue = clickStyleProps[styleProp];

      /**
       * Funtion which wraps the style property. Check if the
       * received feature was clicked or hovered by the user in order
       * to apply the style.
       *
       * @param feature which the style will be applied to.
       */
      const interactionStyleFn = (feature: Record<string, any>) => {
        let styleValue;

        if (
          this._clickFeature &&
          feature.properties.cartodb_id ===
            this._clickFeature.properties.cartodb_id
        ) {
          styleValue = clickStyleValue;
        } else if (
          this._hoverFeature &&
          feature.properties.cartodb_id ===
            this._hoverFeature.properties.cartodb_id
        ) {
          styleValue = hoverStyleValue;
        }

        if (!styleValue) {
          styleValue = defaultStyleValue;
        }

        return typeof styleValue === 'function'
          ? styleValue(feature)
          : styleValue;
      };

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      wrapInteractiveStyle[styleProp] = interactionStyleFn;
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      wrapInteractiveStyle.updateTriggers[styleProp] = interactionStyleFn;
    });

    return new Style({
      ...styleProps,
      ...wrapInteractiveStyle
    });
  }

  public remove() {
    if (this._deckInstance === undefined) {
      throw new CartoLayerError(
        'This layer cannot be removed because it is not added to a map',
        layerErrorTypes.DECK_MAP_NOT_FOUND
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

enum EventType {
  HOVER = 'hover',
  CLICK = 'click'
}

/**
 * Options of the layer
 */
interface LayerOptions {
  /**
   * id of the layer
   */
  id: string;

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
  onHover: (info: any, event: any) => void;

  /**
   * Whether the layer responds to mouse pointer picking events.
   */
  pickable?: boolean;

  /**
   * Style defined for those features which are hovered
   * by the user.
   */
  hoverStyle?: Style | StyleProperties;

  /**
   * Style defined for those features which are clicked
   * by the user.
   */
  clickStyle?: Style | StyleProperties;
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

type InteractionHandler = (
  features: Record<string, unknown>[],
  coordinates: number[],
  event: HammerInput
) => void;
