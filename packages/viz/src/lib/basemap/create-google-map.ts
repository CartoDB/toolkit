import { CartoBaseMapError } from '../errors/basemap-error';

interface GoogleMapOptions {
  container?: Element | string;
  mapOptions?: google.maps.MapOptions;
}

const DEFAULT_OPTIONS: GoogleMapOptions = {
  container: 'map',
  mapOptions: {
    mapTypeId: 'roadmap',
    center: { lat: 0, lng: 0 },
    zoom: 1
  }
};

/**
 * A helper function to create a GoogleMaps basemap on a 'map' DOM element, rendered using *Google Maps JS API*
 *
 * Examples:
 * ```javascript
 *    // Several options to create the map are allowed
 *    const deckMap = carto.viz.createGoogleMap();
 *    const deckMap = carto.viz.createGoogleMap({ mapOptions: { mapTypeId: 'satellite'} });
 *    const deckMap = carto.viz.createGoogleMap({ mapOptions: { mapTypeId: 'hybrid', zoom: 4 } });
 *    const deckMap = carto.viz.createGoogleMap({ container: 'map', mapOptions: { mapTypeId: 'terrain', zoom: 4, center: { lng: 3, lat: 40 } } });
 * ```
 * @export
 * @param {GoogleMapOptions} options
 * @returns
 */
export function createGoogleMap(options: GoogleMapOptions = DEFAULT_OPTIONS) {
  if (!window.google.maps.Map) {
    throw new CartoBaseMapError(
      'Google Maps JavaScript API not found within window context. Please check documentation to know more about how to configure it.'
    );
  }

  const container = options.container || DEFAULT_OPTIONS.container || 'map';
  const element =
    typeof container === 'string'
      ? (document.getElementById(container) as Element)
      : container;

  const mapOptions = { ...DEFAULT_OPTIONS.mapOptions, ...options.mapOptions };

  // Google Maps setup & DeckGL as an overlay
  const baseMap = new window.google.maps.Map(element, mapOptions);
  const deckOverlay = new (window.deck.GoogleMapsOverlay as any)({
    layers: []
  });
  deckOverlay.setMap(baseMap);
  return deckOverlay;
}
