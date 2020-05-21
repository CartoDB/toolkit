import { Deck } from '@deck.gl/core';
import { Popup, PopupElement } from '../popups/Popup';
import { Style } from '../style/Style';
import { LayerOptions } from './LayerOptions';
import { StyledLayer } from '../style/layer-style';

export class LayerInteractivity {
  private _props: Partial<LayerOptions>;

  private _deckInstance?: Deck;

  private _clickPopup?: Popup;
  private _hoverPopup?: Popup;

  private _hoverFeature?: Record<string, any>;
  private _clickFeature?: Record<string, any>;

  private _hoverStyle?: Style;
  private _clickStyle?: Style;

  private _layerGetStyleFn: () => Style;
  private _layerSetStyleFn: (style: Style) => Promise<void>;

  private _layer: StyledLayer;

  constructor(
    layer: StyledLayer,
    layerGetStyleFn: () => Style,
    layerSetStyleFn: (style: Style) => Promise<void>,
    hoverStyle?: Style,
    clickStyle?: Style
  ) {
    this._props = {};
    this._layer = layer;
    this._layerGetStyleFn = layerGetStyleFn;
    this._layerSetStyleFn = layerSetStyleFn;
    this._hoverStyle = hoverStyle;
    this._clickStyle = clickStyle;

    if (this._clickStyle) {
      this.on(EventType.CLICK, () => {
        const interactiveStyle = this._wrapInteractiveStyle();
        this._layerSetStyleFn(interactiveStyle);
      });
    }

    if (this._hoverStyle) {
      this.on(EventType.HOVER, () => {
        const interactiveStyle = this._wrapInteractiveStyle();
        this._layerSetStyleFn(interactiveStyle);
      });
    } else {
      this._props.onHover = this._setStyleCursor.bind(this);
    }
  }

  public getProps() {
    return this._props;
  }

  public setDeckInstance(deckInstance: Deck) {
    this._deckInstance = deckInstance;

    if (this._clickPopup) {
      this._clickPopup.addTo(this._deckInstance);
    }

    if (this._hoverPopup) {
      this._hoverPopup.addTo(this._deckInstance);
    }
  }

  /**
   * TODO Attaches an event handler function defined by the user to
   * this layer.
   *
   * @param eventType - Event type
   * @param eventHandler - Event handler defined by the user
   */
  public on(eventType: EventType, eventHandler?: InteractionHandler) {
    if (!eventHandler) {
      if (eventType === EventType.CLICK) {
        this._props.onClick = undefined;
      } else if (eventType === EventType.HOVER) {
        this._props.onHover = this._setStyleCursor.bind(this);
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

        if (this._clickStyle || this._hoverStyle) {
          const interactiveStyle = this._wrapInteractiveStyle();
          this._layerSetStyleFn(interactiveStyle);
        }

        eventHandler.call(this, features, coordinate, event);
      };

      if (eventType === EventType.CLICK) {
        this._props.onClick = layerHandlerFn;
      } else if (eventType === EventType.HOVER) {
        this._props.onHover = layerHandlerFn;
      }

      this._props.pickable = true;
    }
  }

  /**
   * @public
   * This method creates popups every time the
   * user clicks on one or more features of the layer.
   */
  public setPopupClick(elements: PopupElement[] | string[] | null = []) {
    // if the popup was not created yet then we create it and add it to the map
    if (elements && elements.length > 0 && !this._clickPopup) {
      this._clickPopup = new Popup();

      if (this._deckInstance) {
        this._clickPopup.addTo(this._deckInstance);
      }
    }

    this._popupHandler(EventType.CLICK, elements);
  }

  public setPopupHover(elements: PopupElement[] | string[] | null = []) {
    // if the popup was not created yet then we create it and add it to the map
    if (elements && elements.length > 0 && !this._hoverPopup) {
      this._hoverPopup = new Popup({ closeButton: false });

      if (this._deckInstance) {
        this._hoverPopup.addTo(this._deckInstance);
      }
    }

    this._popupHandler(EventType.HOVER, elements);
  }

  private _popupHandler(
    eventType: EventType,
    elements: PopupElement[] | string[] | null = []
  ) {
    const popup =
      eventType === EventType.CLICK ? this._clickPopup : this._hoverPopup;

    if (elements && elements.length > 0 && popup) {
      this.on(eventType, popup.createHandler(elements));
    } else if (!elements || elements.length === 0) {
      if (popup) {
        popup.close();
      }

      this.on(eventType, undefined);
    }
  }

  /**
   * Wraps the style defined by the user with new functions
   * to check if the feature received by paramter has been clicked
   * or hovered by the user in order to apply the interaction style
   */
  private _wrapInteractiveStyle() {
    const wrapInteractiveStyle = { updateTriggers: {} };

    const currentStyle = this._layerGetStyleFn();
    const styleProps = currentStyle.getLayerProps(this._layer);

    let clickStyleProps = {};

    if (this._clickStyle) {
      clickStyleProps = this._clickStyle.getLayerProps(this._layer);
    }

    let hoverStyleProps = {};

    if (this._hoverStyle) {
      hoverStyleProps = this._hoverStyle.getLayerProps(this._layer);
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

  /**
   * Handler for set the style cursor if is
   * hover a feature.
   *
   * @param info - picked info from the layer
   */
  private _setStyleCursor(info: any) {
    if (this._deckInstance) {
      this._deckInstance.setProps({
        getCursor: () => (info.object ? 'pointer' : 'grab')
      });
    }
  }
}

export enum EventType {
  HOVER = 'hover',
  CLICK = 'click'
}

export type InteractionHandler = (
  features: Record<string, unknown>[],
  coordinates: number[],
  event: HammerInput
) => void;
