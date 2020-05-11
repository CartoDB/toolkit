import { CartoPopupError, popupErrorTypes } from '../errors/popup-error';
import { DeckInstance } from '../basemap/create-map';

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
  private _options: any;
  private _coordinates: number[] | undefined;
  private _deckInstance: DeckInstance | undefined;
  private _container: HTMLElement;

  constructor(options: any = {}) {
    this._options = {
      ...defaultOptions,
      ...options
    };
    this._container = this._createContainerElem();
  }

  /**
   * Adds this popup to the map instance
   * provided by parameter.
   *
   * @param deckInstance deckGL instance which the popup
   * will be added to.
   */
  public addTo(deckInstance: DeckInstance) {
    this._deckInstance = deckInstance;

    const {
      props: { canvas }
    } = deckInstance;
    const canvasElem =
      typeof canvas === 'string' ? document.getElementById(canvas) : canvas;

    if (canvasElem && canvasElem.parentElement) {
      canvasElem.parentElement.appendChild(this._container);
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
   * Closes this popup.
   */
  public close() {
    if (this._container.parentElement) {
      this._container.parentElement.removeChild(this._container);
    }
  }

  private _render() {
    if (this._coordinates) {
      // transform coordinates to viewport pixels
      const viewport = this._deckInstance?.getViewports(undefined)[0];

      if (viewport) {
        const [x, y] = viewport.project(this._coordinates);

        this._container.style.left = `${x}px`;
        this._container.style.top = `${y}px`;
      }
    }
  }

  private _createContainerElem() {
    const containerElem = document.createElement('div');
    containerElem.className = this._options.containerClassName;
    containerElem.setAttribute(
      'style',
      'position: absolute; z-index: 1; display: block;pointer-events: none'
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

  /**
   * Generates the HTML content for a feature properties provided
   * by parameter according to the popup elements.
   *
   * @param elements - popup elements to be shown.
   * @param featureProperties - properties of the feature to use.
   */
  public static generatePopupContent(
    elements: any,
    featureProperties: any
  ): string {
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
}
