import { DeckInstance } from '../../basemap/create-map';

/**
 * Abstract class which has the methods
 * needed to manage lib base popups: mapbox-gl
 * and google maps.
 */
export abstract class InternalPopup {
  /**
   * Adds the popup to a map instance.
   *
   * @param map instance where the popup will
   * be added.
   */
  public abstract addTo(map: DeckInstance): void;

  /**
   * Sets the coordinate of the popup.
   *
   * @param coordinate with long lat.
   */
  public abstract setCoordinate(coordinate: number[]): void;

  /**
   * Sets the HTML content of the popup.
   *
   * @param content in HTML format
   */
  public abstract setContent(content: string): void;

  /**
   * Closes this popup.
   */
  public abstract close(): void;
}
