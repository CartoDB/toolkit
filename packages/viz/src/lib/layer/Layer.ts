import { Deck } from '@deck.gl/core';
import { CartoError } from '@carto/toolkit-core';
import { MVTLayer } from '@deck.gl/geo-layers';
import { Source } from '../sources/Source';
import { CARTOSource, DOSource } from '../sources';
import { DOLayer } from '../deck/DOLayer';
import { getStyles, StyleProperties, Style } from '../style';
import { PopupElement } from '../popups/Popup';
import { StyledLayer } from '../style/layer-style';
import { CartoLayerError, layerErrorTypes } from '../errors/layer-error';
import {
  LayerInteractivity,
  EventType,
  InteractionHandler
} from './LayerInteractivity';
import { LayerOptions } from './LayerOptions';
import {
  ViewportFeaturesGenerator,
  ViewportFeaturesOptions
} from '../interactivity/viewport-features/ViewportFeaturesGenerator';

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

  private _interactivity: LayerInteractivity;

  // Viewport Features Generator instance to get current features within viewport
  private _viewportFeaturesGenerator = new ViewportFeaturesGenerator();

  constructor(
    source: string | Source,
    style: Style | StyleProperties = {},
    options?: Partial<LayerOptions>
  ) {
    this._source = buildSource(source);
    this._style = buildStyle(style);

    this._interactivity = this._buildInteractivity(options);

    this._options = {
      id: `${this._source.id}-${Date.now()}`,
      ...this._interactivity.getProps(),
      ...options
    };
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
   * Retrieves the current style of the layer
   */
  public getStyle() {
    let styleProps;

    if (this._style) {
      styleProps = this._style.getLayerProps(this);
    }

    const metadata = this._source.getMetadata();
    const defaultStyleProps = getStyles(metadata.geometryType);

    if (
      metadata.geometryType === 'Point' &&
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      defaultStyleProps.pointRadiusScale
    ) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      defaultStyleProps.pointRadiusMaxPixels *=
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        defaultStyleProps.pointRadiusScale;
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      defaultStyleProps.pointRadiusMinPixels *=
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        defaultStyleProps.pointRadiusScale;
    }

    if (
      ['Point', 'Polygon'].includes(metadata.geometryType) &&
      defaultStyleProps.getLineWidth === 0
    ) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      defaultStyleProps.stroked = false;
    }

    return new Style({
      ...defaultStyleProps,
      ...styleProps
    });
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
    this._interactivity.setDeckInstance(this._deckInstance);

    this._viewportFeaturesGenerator.setDeckInstance(deckInstance);
    this._viewportFeaturesGenerator.setDeckLayer(createdDeckGLLayer);
  }

  /**
   * Attaches an event handler function defined by the user to
   * this layer.
   *
   * @param eventType - Event type
   * @param eventHandler - Event handler defined by the user
   */
  public async on(eventType: EventType, eventHandler?: InteractionHandler) {
    this._interactivity.on(eventType, eventHandler);

    if (this._deckLayer) {
      await this._replaceLayer();
    }
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

  private _getLayerProperties() {
    const interactivityProps = this._interactivity.getProps();
    const props = this._source.getProps();
    const styleProps = this.getStyle().getLayerProps(this);

    const layerProps = {
      ...this._options,
      ...interactivityProps,
      ...props,
      ...styleProps,
      updateTriggers: {
        onClick: interactivityProps.onClick,
        onHover: interactivityProps.onHover,
        ...styleProps.updateTriggers
      }
    };

    return layerProps;
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

      this._viewportFeaturesGenerator.setDeckLayer(newLayer);
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
    this._interactivity.setPopupClick(elements);

    if (this._deckLayer) {
      await this._replaceLayer();
    }
  }

  public async setPopupHover(elements: PopupElement[] | string[] | null = []) {
    this._interactivity.setPopupHover(elements);

    if (this._deckLayer) {
      await this._replaceLayer();
    }
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

  private _buildInteractivity(options: Partial<LayerOptions> = {}) {
    let hoverStyle;

    if (options.hoverStyle) {
      hoverStyle =
        typeof options.hoverStyle === 'string'
          ? options.hoverStyle
          : buildStyle(options.hoverStyle as Style | StyleProperties);
    }

    let clickStyle;

    if (options.clickStyle) {
      clickStyle =
        typeof options.clickStyle === 'string'
          ? options.clickStyle
          : buildStyle(options.clickStyle as Style | StyleProperties);
    }

    return new LayerInteractivity(
      this,
      this.getStyle.bind(this),
      this.setStyle.bind(this),
      hoverStyle,
      clickStyle
    );
  }
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
