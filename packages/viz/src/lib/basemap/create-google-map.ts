import { CartoBaseMapError } from '../errors/basemap-error';

/**
 * A helper function to create a GoogleMaps basemap on a 'map' DOM element, rendered using *Google Maps JS API*
 *
 * Examples:
 * ```javascript
 *    // Several options to create the map are allowed
 *    const deckMap = carto.viz.map();
 *    const deckMap = carto.viz.map('voyager');
 *    const deckMap = carto.viz.map('darkmatter', { zoom: 4 });
 *    const deckMap = carto.viz.map('positron', { zoom: 4, longitude: 3, latitude: 40, pitch: 45, bearing: 30 }, 'map');
 *
 *    const deckMap = carto.viz.gmap();
 *    const deckMap = carto.viz.gmap('satellite');
 *    const deckMap = carto.viz.gmap('hybrid', { zoom: 4 });
 *    const deckMap = carto.viz.gmap('terrain',  { zoom: 4, center: { lng: 3, lat: 40 } }, 'map');
 * ```
 * @export
 * @param {string} [mapTypeId='roadmap']
 * @param {*} [mapOptions] https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions
 * @param {string} [containerId='map']
 * @returns
 */
export function createGoogleMap(
  mapTypeId = 'roadmap',
  mapOptions?: any,
  containerId = 'map'
) {
  if (!window.google.maps.Map) {
    throw new CartoBaseMapError(
      'Google Maps JavaScript API not found within window context. Please check documentation to know more about how to configure it.'
    );
  }

  const DEFAULT_OPTIONS = {
    center: { lat: 0, lng: 0 },
    zoom: 1,
    mapTypeId
  };

  const container = window.document.getElementById(containerId);
  const view = { ...DEFAULT_OPTIONS, ...mapOptions };
  const baseMap = new (window.google.maps.Map as any)(container, view);
  const deckOverlay = new (window.deck.GoogleMapsOverlay as any)({
    layers: []
  });
  deckOverlay.setMap(baseMap);

  return deckOverlay;
}
