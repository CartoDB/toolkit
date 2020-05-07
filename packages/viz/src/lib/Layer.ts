import { MapboxLayer } from '@deck.gl/mapbox';
import { MVTLayer } from '@deck.gl/geo-layers';
import { Source } from './sources/Source';
import { CARTOSource } from './sources/CARTOSource';
import { DOSource } from './sources/DOSource';
import { DOLayer } from './deck/DOLayer';
import { defaultStyles, StyleProperties, Style } from './style';
import { Popup } from './popups/Popup';
import { DeckInstance } from './basemap/create-map';

export class Layer {
  private _options: LayerOptions = {};
  private _source: Source;
  private _style?: Style;

  // Deck.gl Map instance
  private _deckInstance: DeckInstance | undefined;

  // Instance to the DeckLayer of the instance
  // It cannot be a reference to (import { Layer } from '@deck.gl/core') because
  // the typing of getPickinfo method is different from TileLayer and Layer are
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _deckLayer?: any;

  constructor(
    source: string | Source,
    style: Style | StyleProperties = {},
    options: LayerOptions = {}
  ) {
    this._source = buildSource(source);
    this._style = buildStyle(style);

    const defaultId = `${this._source.id}-${Date.now()}`;
    Object.assign(this._options, options, { id: defaultId });
  }

  public get id() {
    return this._options.id;
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
    const createdDeckGLLayer = await this._createDeckGLLayer();

    const map = deckInstance.getMapboxMap();
    map.addLayer(createdDeckGLLayer);

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
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      this._deckLayer = new MapboxLayer(layerProperties);
    } else if (this._source instanceof DOSource) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      this._deckLayer = new DOLayer(layerProperties);
    } else {
      throw Error('Unsupported source instance');
    }

    return this._deckLayer;
  }

  private async _getLayerProperties() {
    const metadata = this._source.getMetadata();

    const styleProps = this._style
      ? this._style.getProperties(this._source)
      : undefined;

    const props = this._source.getProps();

    return {
      ...this._options,
      ...props,
      ...defaultStyles(metadata.geometryType),
      ...styleProps,
      type: MVTLayer
    };
  }
  /**
   * Replace a layer source
   */
  private async _replaceLayer() {
    // const newLayer = await this._createDeckGLLayer();

    if (this._deckInstance === undefined) {
      throw new Error('Undefined Deck.GL instance');
    }

    const layerProperties = await this._getLayerProperties();
    this._deckLayer.setProps(layerProperties);
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
      let popup: Popup | null = null;
      // eslint-disable-next-line padding-line-between-statements, @typescript-eslint/no-unused-vars
      this._options.onClick = info => {
        if (this._deckInstance) {
          const {
            lngLat,
            object: { properties }
          } = info;

          const popupContent: string = generatePopupContent(
            elements,
            properties
          );

          if (popup === null) {
            popup = new Popup();
          }

          popup.setContent(popupContent);
          popup.setCoordinate(lngLat);
          popup.addTo(this._deckInstance);
        }
      };

      this._options.pickable = true;
    } else {
      this._options.onClick = undefined;
      this._options.pickable = !!this._options.onHover;
    }

    if (this._deckLayer) {
      await this._replaceLayer();
    }
  }

  public async setPopupHover(elements: PopupElement[] | string[] | null = []) {
    if (elements && elements.length > 0) {
      let popup: Popup | null = null;
      // eslint-disable-next-line padding-line-between-statements, @typescript-eslint/no-unused-vars
      this._options.onHover = info => {
        if (this._deckInstance) {
          const { lngLat, object } = info;

          if (object) {
            // enter a feature
            const { properties } = object;
            const popupContent: string = generatePopupContent(
              elements,
              properties
            );

            if (popup === null) {
              popup = new Popup({ closeButton: false });
            }

            popup.setContent(popupContent);
            popup.setCoordinate(lngLat);
            popup.addTo(this._deckInstance);
          } else if (!object && popup !== null) {
            // leave the feature
            popup.close();
            popup = null;
          }
        }
      };

      this._options.pickable = true;
    } else {
      this._options.onHover = undefined;
      this._options.pickable = !!this._options.onClick;
    }

    if (this._deckLayer) {
      await this._replaceLayer();
    }
  }
}

function generatePopupContent(elements: any, featureProperties: any): string {
  return elements
    .map((element: any) => {
      let { attr } = element;
      const { title, format } = element;

      if (typeof element === 'string') {
        attr = element;
      }

      const elementValue = featureProperties[attr];
      let elementContent = `<h2>${attr}</h2>`;

      if (title) {
        elementContent = `<h1>${title}<h1>`;
      }

      if (format && typeof format === 'function') {
        // TODO what is format?
        elementContent += format.call(element, elementValue);
      } else {
        elementContent += `<h3>${elementValue}</h3>`;
      }

      return elementContent;
    })
    .join('');
}

/**
 * Popup element options.
 */
interface PopupElement {
  /**
   * Name of the attribute.
   */
  attr: string;

  /**
   * Title for this element.
   */
  title?: string;

  /**
   * d3 format for the value of this attribute.
   */
  format?: string;
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
