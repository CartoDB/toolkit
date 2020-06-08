import { Deck } from '@deck.gl/core';
import { format as d3Format } from 'd3-format';
import { CartoPopupError, popupErrorTypes } from '../errors/popup-error';

/**
 * Default options for the Popup
 */
const defaultOptions = {
  closeButton: true,
  containerClassName: 'carto-popup',
  contentClassName: 'as-body',
  closeButtonClassName: 'as-btn'
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

  constructor(options: Partial<PopupOptions> = defaultOptions) {
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

    // TODO(jbotella): Fix Deck.gl types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { canvas } = deckInstance.props as any;

    const canvasElem =
      typeof canvas === 'string' ? document.getElementById(canvas) : canvas;

    if (canvasElem && canvasElem.parentElement) {
      this._parentElement = canvasElem.parentElement;
    }

    const { onAfterRender } = this._deckInstance.props;
    this._deckInstance.setProps({
      onAfterRender: (...args: any) => {
        this._render();

        if (onAfterRender) {
          onAfterRender(args);
        }
      }
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
      `.${this._options.contentClassName}`
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
      `.${this._options.contentClassName}`
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
  public createHandler(elements: PopupElement[] | string[] | null = []) {
    return ([features, coordinates]: [
      Record<string, any>[],
      number[],
      HammerInput
    ]) => {
      if (features.length > 0) {
        const popupContent: string = generatePopupContent(elements, features);
        this.open();
        this.setContent(popupContent);

        // to be more accurate on points we use the feature
        // coordinates instead of the coordinates where the user clicked
        // if (features[0].geometry.type === 'Point') {
        //   const featureCoordinates = pixels2coordinates(
        //     features[0].geometry.coordinates,
        //     this._deckInstance
        //   );
        //   this.setCoordinates(featureCoordinates);
        // } else {
        this.setCoordinates(coordinates);
        // }
      } else {
        this.close();
      }
    };
  }

  private _render() {
    if (
      this._coordinates &&
      this.getContent().trim().length > 0 &&
      this._deckInstance
    ) {
      const pixels = coordinates2pixels(this._coordinates, this._deckInstance);

      if (pixels) {
        this._container.style.display = 'block';
        this._adjustPopupPosition(pixels);
      }
    }
  }

  private _createContainerElem() {
    const containerElem = document.createElement('as-infowindow');
    containerElem.setAttribute(
      'style',
      'position: absolute; z-index: 1; pointer-events: none'
    );

    if (this._options.closeButton) {
      // enable pointer events
      containerElem.style.pointerEvents = 'inherit';
      // create the close button
      const closeButton = document.createElement('button');
      closeButton.className = this._options.closeButtonClassName;
      closeButton.addEventListener('click', this.close.bind(this));
      closeButton.innerHTML = `<i class="as-icon as-icon-close as-color--primary"></i>`;
      containerElem.appendChild(closeButton);
    }

    const contentElement = document.createElement('p');
    contentElement.className = this._options.contentClassName;
    containerElem.appendChild(contentElement);

    return containerElem;
  }

  private _adjustPopupPosition(pixels: number[]) {
    const HOOK_HEIGHT = 12;
    const containerHeight = this._container.offsetHeight;
    const [x, y] = pixels;
    this._container.style.left = `${x}px`;
    this._container.style.top = `${y - containerHeight - HOOK_HEIGHT}px`;
  }
}

/**
 * Generates the HTML content for a feature properties provided
 * by parameter according to the popup elements.
 *
 * @param elements - popup elements to be shown.
 * @param features - features with the properties to use.
 */
function generatePopupContent(
  elements: any,
  features: Record<string, any>[]
): string {
  return features
    .map(feature =>
      elements
        .map((element: any) => {
          let { attr, title } = element;
          const { format } = element;

          if (typeof element === 'string') {
            attr = element;
            title = attr;
          }

          if (title === null) {
            title = '';
          }

          let elementValue = feature.properties[attr];

          if (format && typeof format === 'function') {
            elementValue = format(elementValue);
          } else if (format && typeof format === 'string') {
            let formatter;

            try {
              formatter = d3Format(format);
            } catch (err) {
              throw new CartoPopupError(
                `The format '${format}' is not a recognized D3 format`,
                popupErrorTypes.FORMAT_INVALID
              );
            }

            elementValue = formatter(elementValue);
          }

          return `<p class="as-body">${title}</p>
              <p class="as-subheader as-font--medium">${elementValue}</p>`;
        })
        .join('')
    )
    .join('');
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

// function pixels2coordinates(pixels: number[], deckInstance?: Deck) {
//   let coordinates;

//   if (deckInstance) {
//     const viewport = deckInstance.getViewports(undefined)[0];
//     coordinates = viewport.unproject(pixels);
//   }

//   return coordinates;
// }

function coordinates2pixels(coordinates: number[], deckInstance?: Deck) {
  let pixels;

  if (deckInstance) {
    const viewport = deckInstance.getViewports(undefined)[0];

    if (viewport) {
      pixels = viewport.project(coordinates);
    }
  }

  return pixels;
}
