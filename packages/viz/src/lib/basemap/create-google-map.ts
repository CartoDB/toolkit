import { CartoBaseMapError } from '../errors/basemap-error';

const DEFAULT_OPTIONS: google.maps.MapOptions = {
  mapTypeId: 'roadmap',
  center: { lat: 0, lng: 0 },
  zoom: 1
};

/**
 * A helper function to create a GoogleMaps basemap on a 'map' DOM element, rendered using *Google Maps JS API*
 *
 * Examples:
 * ```javascript
 *    // Several options to create the map are allowed
 *    const deckMap = carto.viz.createGoogleMap();
 *    const deckMap = carto.viz.createGoogleMap('map', { mapTypeId: 'satellite'});
 *    const deckMap = carto.viz.createGoogleMap('map', { mapTypeId: 'hybrid', zoom: 4 });
 *    const deckMap = carto.viz.createGoogleMap('map', { mapTypeId: 'terrain', zoom: 4, center: { lng: 3, lat: 40 } });
 * ```
 * @export
 * @param {Element | string} container
 * @param {google.maps.MapOptions} googleMapsOptions
 * @returns
 */
export function createGoogleMap(
  container = 'map',
  options: google.maps.MapOptions = DEFAULT_OPTIONS
) {
  if (!window.google.maps.Map) {
    throw new CartoBaseMapError(
      'Google Maps JavaScript API not found within window context. Please check documentation to know more about how to configure it.'
    );
  }

  const mapOptions = { ...DEFAULT_OPTIONS, ...options };
  const element =
    typeof container === 'string'
      ? (document.getElementById(container) as Element)
      : container;

  // Google Maps setup
  const baseMap = new window.google.maps.Map(element, mapOptions);

  // Deckgl as an overlay
  const deckOverlay = new (window.deck.GoogleMapsOverlay as any)({
    layers: []
  });
  deckOverlay.setMap(baseMap);

  return deckOverlay;
}
