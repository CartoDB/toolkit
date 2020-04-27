/* eslint-disable @typescript-eslint/no-explicit-any */

import { GoogleMapsOverlay } from '@deck.gl/google-maps';

/**
 * DeckGL & Google Maps JS globally available at Window, for viz helpers
 */

declare global {
  interface Window {
    deck: {
      DeckGL(params?: any): any;
      GoogleMapsOverlay: GoogleMapsOverlay;
    };

    google: {
      maps: {
        Map: google.maps.Map;
      };
    };
  }
}

export {};
