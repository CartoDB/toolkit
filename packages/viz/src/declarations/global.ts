/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * DeckGL & Google Maps JS globally available at Window, for viz helpers
 */
export {};

declare global {
  interface Window {
    deck: {
      DeckGL(params?: any): any;
      GoogleMapsOverlay(params?: any): any;
    };

    google: {
      maps: {
        Map(mapContainer?: any, opts?: any): any;
      };
    };
  }
}
