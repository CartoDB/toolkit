import { CartoPopupError, popupErrorTypes } from '../errors/popup-error';
import { InternalPopup } from './internal/InternalPopup';
import { MapboxPopup } from './internal/MapboxPopup';
import { GMapPopup } from './internal/GMapPopup';
import { MapType } from '../basemap/MapType';
import { DeckInstance } from '../basemap/create-map';

/**
 * @class
 * This class wraps the popup based on the
 * implementation.
 */
export class Popup {
  private _content: string;
  private _coordinate: number[];
  private _options: any;
  private _internalPopup: InternalPopup | undefined;

  constructor(options: any = {}) {
    this._options = options;
    this._content = '';
    this._coordinate = [];
  }

  /**
   * Adds this popup to the map instance
   * provided by parameter.
   *
   * @param map instance which the popup
   * will be added to.
   */
  public addTo(map: DeckInstance) {
    if (!this._internalPopup) {
      this._internalPopup = this._createInternalPopup(map);
    }

    this._internalPopup.setCoordinate(this._coordinate);
    this._internalPopup.setContent(this._content);
    this._internalPopup.addTo(map);
  }

  /**
   * Sets the coordinate of the popup.
   *
   * @param coordinate with long lat.
   */
  public setCoordinate(coordinate: number[]) {
    if (!coordinate || coordinate.length !== 2) {
      throw new CartoPopupError(
        'Popup coordinate invalid',
        popupErrorTypes.COORDINATE_INVALID
      );
    }

    this._coordinate = coordinate;

    if (this._internalPopup) {
      this._internalPopup.setCoordinate(this._coordinate);
    }
  }

  /**
   * Sets the HTML content of the popup.
   *
   * @param content in HTML format
   */
  public setContent(content = '') {
    this._content = content;

    if (this._internalPopup) {
      this._internalPopup.setContent(this._content);
    }
  }

  /**
   * Closes this popup.
   */
  public close() {
    if (this._internalPopup) {
      this._internalPopup.close();
    }
  }

  /**
   * @private
   * Creates the internal popup depending on
   * the map type: mapboxgl or google maps.
   *
   * @param map where the popup will be added.
   */
  private _createInternalPopup(map: DeckInstance): InternalPopup {
    let popup;
    const type = map.getMapType();

    if (type === MapType.MAPBOX_GL) {
      popup = new MapboxPopup(this._options);
    } else {
      popup = new GMapPopup();
    }

    return popup;
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
