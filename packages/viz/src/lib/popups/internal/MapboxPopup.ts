import { InternalPopup } from './InternalPopup';
import { DeckInstance } from '../../basemap/create-map';

/**
 * This class implements the popup methods for
 * MapboxGL.
 */
export class MapboxPopup extends InternalPopup {
  private _popup: any;

  constructor(options: any = {}) {
    super();
    Object.assign(options, options, defaultOptions);
    this._popup = new (window as any).mapboxgl.Popup(options);
  }

  public addTo(deckInstance: DeckInstance): void {
    const map = deckInstance.getMapboxMap();
    this._popup.addTo(map);
  }

  public setCoordinates(coordinates: number[]): void {
    this._popup.setLngLat(coordinates);
  }

  public setContent(content: string): void {
    this._popup.setHTML(content);
  }

  public close(): void {
    this._popup.remove();
  }
}

/**
 * Default options for MapboxGL popups.
 */
const defaultOptions = {
  closeOnClick: false
};
