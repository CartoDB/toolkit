import { Deck } from '@deck.gl/core';
import { CartoError, WithEvents } from '@carto/toolkit-core';
import { MVTLayer } from '@deck.gl/geo-layers';
import mitt from 'mitt';
import { Source, Field } from '../sources/Source';
import { CARTOSource, DOSource } from '../sources';
import { DOLayer } from '../deck/DOLayer';
import { getStyles, StyleProperties, Style } from '../style';
import { ViewportFeaturesGenerator } from '../interactivity/viewport-features/ViewportFeaturesGenerator';
import { PopupElement } from '../popups/Popup';
import { StyledLayer } from '../style/layer-style';
import { CartoLayerError, layerErrorTypes } from '../errors/layer-error';
import {
  LayerInteractivity,
  InteractivityEventType
} from './LayerInteractivity';
import { LayerOptions } from './LayerOptions';

export class Layer extends WithEvents implements StyledLayer {
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

  // pickable events count
  private _pickableEventsCount = 0;
  private _fields: Field[];

  constructor(
    source: string | Source,
    style: Style | StyleProperties = {},
    options?: Partial<LayerOptions>
  ) {
    super();

    this._source = buildSource(source);
    this._style = buildStyle(style);

    this.registerAvailableEvents([
      'viewportLoad',
      InteractivityEventType.CLICK.toString(),
      InteractivityEventType.HOVER.toString()
    ]);

    this._options = {
      id: `${this._source.id}-${Date.now()}`,
      ...options
    };

    this._interactivity = this._buildInteractivity(options);
    this._fields = this._getStyleField() || [];
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
      await this.replaceDeckGLLayer();
    }
  }

  /**
   * Change the styles of the current layer.
   * A new map instantion and a replace of the layer will be fired
   * @param style style to be set
   */
  public async setStyle(style: {}) {
    this._style = buildStyle(style);
    this._fields = this._getStyleField() || [];

    if (this._deckLayer) {
      await this.replaceDeckGLLayer();
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

    this._interactivity.setDeckInstance(deckInstance);

    this._viewportFeaturesGenerator.setDeckInstance(deckInstance);
    this._viewportFeaturesGenerator.setDeckLayer(createdDeckGLLayer);
  }

  /**
   * Sets the layer as pickable and relay on the event manager
   *
   * @param eventType - Event type
   * @param eventHandler - Event handler defined by the user
   */
  public async on(
    eventType: InteractivityEventType | string,
    eventHandler: mitt.Handler
  ) {
    // mark the layer as pickable
    if (
      eventType === InteractivityEventType.CLICK ||
      eventType === InteractivityEventType.HOVER
    ) {
      this._pickableEventsCount += 1;

      if (!this._options.pickable) {
        this._options.pickable = true;

        if (this._deckLayer) {
          await this.replaceDeckGLLayer();
        }
      }
    }

    super.on(eventType as string, eventHandler);
  }

  /**
   * Sets the layer as non-pickable if there are no events
   * attached to it and relay on the event manager
   *
   * @param eventType - Event type
   * @param eventHandler - Event handler defined by the user
   */
  public async off(
    eventType: InteractivityEventType | string,
    eventHandler: mitt.Handler
  ) {
    // mark the layer as non-pickable
    if (
      (eventType === InteractivityEventType.CLICK ||
        eventType === InteractivityEventType.HOVER) &&
      this._pickableEventsCount > 0
    ) {
      this._pickableEventsCount -= 1;

      if (this._pickableEventsCount === 0 && this._options.pickable === true) {
        this._options.pickable = false;

        if (this._deckLayer) {
          await this.replaceDeckGLLayer();
        }
      }
    }

    super.off(eventType as string, eventHandler);
  }

  /**
   * Method to create the Deck.gl layer
   */
  public async _createDeckGLLayer() {
    // The first step is to initialize the source to get the geometryType and the stats
    if (!this._source.isInitialized) {
      await this._source.init(this._fields);
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

  public getViewportFeatures(properties: string[] = []) {
    if (!this._viewportFeaturesGenerator.isReady()) {
      throw new CartoError({
        type: 'Layer',
        message:
          'Cannot retrieve viewport features because this layer has not been added to a map yet'
      });
    }

    return this._viewportFeaturesGenerator.getFeatures(properties);
  }

  private _getLayerProperties() {
    const props = this._source.getProps();
    const styleProps = this.getStyle().getLayerProps(this);

    const events = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onViewportLoad: (...args: any) => {
        // TODO(jbotella): Change typings
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const styleProperties = styleProps as any;

        if (styleProperties.onViewportLoad) {
          styleProperties.onViewportLoad(...args);
        }

        this.emit('viewportLoad', args);
      },
      onClick: this._interactivity.onClick.bind(this._interactivity),
      onHover: this._interactivity.onHover.bind(this._interactivity)
    };

    const layerProps = {
      ...this._options,
      ...props,
      ...styleProps,
      ...events
    };

    return layerProps;
  }

  /**
   * Replace the deck layer with a fresh new one, keeping its order
   */
  public async replaceDeckGLLayer() {
    if (this._deckInstance) {
      const originalPosition = this._deckInstance.props.layers.findIndex(
        (layer: { id: string }) => layer.id === this._options.id
      );

      const otherDeckLayers = this._deckInstance.props.layers.filter(
        (layer: { id: string }) => layer.id !== this._options.id
      );

      const updatedLayers = [...otherDeckLayers];
      const newLayer = await this._createDeckGLLayer();
      updatedLayers.splice(originalPosition, 0, newLayer);

      this._deckInstance.setProps({
        layers: updatedLayers
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
    this._addPopupFields(elements);
  }

  public async setPopupHover(elements: PopupElement[] | string[] | null = []) {
    this._interactivity.setPopupHover(elements);
    this._addPopupFields(elements);
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

    const layerGetStyleFn = this.getStyle.bind(this);
    const layerSetStyleFn = this.setStyle.bind(this);
    const layerEmitFn = this.emit.bind(this);
    const layerOnFn = this.on.bind(this);
    const layerOffFn = this.off.bind(this);

    return new LayerInteractivity({
      layer: this,
      layerGetStyleFn,
      layerSetStyleFn,
      layerEmitFn,
      layerOnFn,
      layerOffFn,
      hoverStyle,
      clickStyle
    });
  }

  // eslint-disable-next-line consistent-return
  private _getStyleField() {
    if (this._style && this._style.field) {
      return [
        {
          column: this._style.field,
          sample: true,
          aggregation: true
        }
      ];
    }
  }

  private _addPopupFields(elements: PopupElement[] | string[] | null = []) {
    if (elements) {
      elements.forEach((e: PopupElement | string) => {
        const column = typeof e === 'string' ? e : e.attr;
        const field = {
          column,
          sample: false,
          aggregation: true
        };
        this._fields.push(field);
      });
    }
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
