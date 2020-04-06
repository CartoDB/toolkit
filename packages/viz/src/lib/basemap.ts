
/**
 * Mapping libraries are meant to be available in the browser before using these helpers
 */
declare global {
  interface Window {
    deck: {
      DeckGL(params?: any): any;
      GoogleMapsOverlay(params?: any): any;
    };

    google: {
      maps: {
        Map(mapContainer?: any, opts?: any): any;
      }
    };
  }
}

interface StyleUrlCatalog { [key: string]: string; }
const cartoBasemaps: StyleUrlCatalog = {
  positron: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  voyager: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  darkmatter: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
};

/**
 * A helper function to create a CARTO basemap on a 'map' DOM element, rendered using *Mapbox GL JS*
 *
 * Examples:
 * ```javascript
 *    // Several options to create the map are allowed
 *    const deckMap = carto.viz.map();
 *    const deckMap = carto.viz.map('voyager');
 *    const deckMap = carto.viz.map('darkmatter', { zoom: 4 });
 *    const deckMap = carto.viz.map('positron', { zoom: 4, longitude: 3, latitude: 40, pitch: 45, bearing: 30 }, 'map');
 * ```
 * @export
 * @param {string} [basemap='positron']
 * @param {*} [view]
 * @param {string} [containerId='map']
 * @returns
 */
export function map(basemap: string = 'positron', view?: any, containerId: string = 'map') {
  if (!window.deck.DeckGL) {
    throw new Error(
      'This helper is meant to be used on the browser, with mapbox & deck available at window'
    );
  }

  const mapStyle = cartoBasemaps[basemap.toLowerCase()];

  const DEFAULT_VIEW = {
    longitude: 0,
    latitude: 0,
    zoom: 1,
  };
  const initialViewState = Object.assign(DEFAULT_VIEW, view);

  const deckMap = new (window.deck.DeckGL as any)({
    mapStyle,
    initialViewState,
    container: containerId,
    controller: true
  });

  return deckMap;
}

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
export function gmap(mapTypeId: string = 'roadmap', mapOptions?: any, containerId: string = 'map') {
  if (!window.google.maps.Map) {
    throw new Error(
      'This helper is meant to be used on the browser, with googlemaps & deck available at window'
    );
  }

  const DEFAULT_OPTIONS = {
    center: {lat: 0, lng: 0},
    zoom: 1,
    mapTypeId
  };

  const container = window.document.getElementById(containerId);
  const view = Object.assign(DEFAULT_OPTIONS, mapOptions);
  const baseMap = new (window.google.maps.Map as any)(container, view);
  const deckOverlay = new (window.deck.GoogleMapsOverlay as any)({ layers: [] });
  deckOverlay.setMap(baseMap);

  return deckOverlay;
}
