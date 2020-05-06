import { Deck } from '@deck.gl/core';
import { InternalPopup } from './InternalPopup';

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

  public addTo(deckInstance: Deck): void {
    const map = deckInstance.getMapboxMap();
    this._popup.addTo(map);
  }

  public setCoordinate(coordinate: number[]): void {
    this._popup.setLngLat(coordinate);
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
  closeOnClick: true
};
