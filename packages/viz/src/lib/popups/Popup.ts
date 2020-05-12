import { Deck } from '@deck.gl/core';
import { CartoPopupError, popupErrorTypes } from '../errors/popup-error';

/**
 * Default options for the Popup
 */
const defaultOptions = {
  closeButton: true,
  containerClassName: 'carto-popup',
  contentClassName: 'carto-popup-content',
  closeButtonClassName: 'carto-popup-close'
};

/**
 * @class
 * This class wraps the popup based on the
 * implementation.
 */
export class Popup {
  private _options: PopupOptions;
  private _coordinates: number[] | undefined;
  private _deckInstance: Deck | undefined;
  private _container: HTMLElement;
  private _parentElement: HTMLElement | undefined;
  private _isOpened: boolean;

  constructor(options: any = defaultOptions) {
    this._options = {
      ...defaultOptions,
      ...options
    };
    this._isOpened = false;
    this._container = this._createContainerElem();
  }

  /**
   * Adds this popup to the map instance
   * provided by parameter.
   *
   * @param deckInstance deckGL instance which the popup
   * will be added to.
   */
  public addTo(deckInstance: Deck) {
    this._deckInstance = deckInstance;

    const {
      props: { canvas }
    } = deckInstance;
    const canvasElem =
      typeof canvas === 'string' ? document.getElementById(canvas) : canvas;

    if (canvasElem && canvasElem.parentElement) {
      this._parentElement = canvasElem.parentElement;
      this.open();
    }

    this._deckInstance.setProps({
      ...this._deckInstance.props,
      onViewStateChange: this._render.bind(this)
    });
    this._render();
  }

  /**
   * Sets the coordinates of the popup.
   *
   * @param coordinates with long lat.
   */
  public setCoordinates(coordinates: number[]) {
    if (!coordinates || coordinates.length !== 2) {
      throw new CartoPopupError(
        'Popup coordinates invalid',
        popupErrorTypes.COORDINATE_INVALID
      );
    }

    this._coordinates = coordinates;

    if (this._deckInstance) {
      this._render();
    }
  }

  /**
   * Gets the HTML content of this popup.
   */
  public getContent(): string {
    let content = '';
    const contentElem = this._container.querySelector(
      `div.${this._options.contentClassName}`
    );

    if (contentElem) {
      content = contentElem.innerHTML;
    }

    return content;
  }

  /**
   * Sets the HTML content of the popup.
   *
   * @param content in HTML format
   */
  public setContent(content = '') {
    const contentElem = this._container.querySelector(
      `div.${this._options.contentClassName}`
    );

    if (contentElem) {
      contentElem.innerHTML = content;
    }
  }

  /**
   * Open this popup.
   */
  public open() {
    if (this._parentElement && !this._isOpened) {
      this._parentElement.appendChild(this._container);
    }

    this._isOpened = true;
  }

  /**
   * Closes this popup.
   */
  public close() {
    if (this._parentElement && this._isOpened) {
      this._parentElement.removeChild(this._container);
    }

    this._isOpened = false;
  }

  /**
   * Creates a function to handler popup.
   *
   * @param elements popup elements to generate popup
   * content.
   */
  public createHandler(elements: PopupElement[] | string[]) {
    return (info: any) => {
      const { lngLat, object } = info;

      if (object) {
        const { properties } = object;
        const popupContent: string = generatePopupContent(elements, properties);
        this.setCoordinates(lngLat);
        this.setContent(popupContent);
        this.open();
      } else {
        this.close();
      }
    };
  }

  private _render() {
    if (this._coordinates && this._deckInstance) {
      // transform coordinates to viewport pixels
      const viewport = this._deckInstance.getViewports(undefined)[0];

      if (viewport) {
        const [x, y] = viewport.project(this._coordinates);

        this._container.style.left = `${x}px`;
        this._container.style.top = `${y}px`;
      }
    }

    // shows the popup only if it has coordinates and content
    if (this._coordinates && this.getContent().trim().length > 0) {
      this._container.style.display = 'block';
    }
  }

  private _createContainerElem() {
    const containerElem = document.createElement('div');
    containerElem.className = this._options.containerClassName;
    containerElem.setAttribute(
      'style',
      'position: absolute; z-index: 1; display: none;pointer-events: none'
    );

    if (this._options.closeButton) {
      // enable pointer events
      containerElem.style.pointerEvents = 'inherit';
      // create the close button
      const closeButton = document.createElement('button');
      closeButton.className = this._options.closeButtonClassName;
      closeButton.addEventListener('click', this.close.bind(this));
      containerElem.appendChild(closeButton);
    }

    const contentElement = document.createElement('div');
    contentElement.className = this._options.contentClassName;
    containerElem.appendChild(contentElement);

    return containerElem;
  }
}

/**
 * Generates the HTML content for a feature properties provided
 * by parameter according to the popup elements.
 *
 * @param elements - popup elements to be shown.
 * @param featureProperties - properties of the feature to use.
 */
function generatePopupContent(elements: any, featureProperties: any): string {
  const popupContent = elements
    .map((element: any) => {
      let { attr } = element;
      const { title, format } = element;

      if (typeof element === 'string') {
        attr = element;
      }

      let elementValue = featureProperties[attr];

      if (format && typeof format === 'function') {
        // TODO what is format?
        elementValue = format.call(element, elementValue);
      }

      return `<span class="popup-name">${title || attr}</span>
              <span class="popup-value">${elementValue}</span>`;
    })
    .join('');

  return `<div class="popup-content">${popupContent}</div>`;
}

/**
 * Popup element options.
 */
export interface PopupElement {
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
 * Popup options
 */
interface PopupOptions {
  /**
   * Flag to indicate whether a close
   * button is shown in the popup.
   *
   * @defaultValue false
   */
  closeButton: boolean;

  /**
   * Class name for the popup container.
   */
  containerClassName: string;

  /**
   * Class name for the popup content.
   */
  contentClassName: string;

  /**
   * Class name for the close button.
   */
  closeButtonClassName: string;
}
