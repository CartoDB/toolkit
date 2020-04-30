import { CartoMapStyle } from './CartoMapStyle';
import { CartoBaseMapError } from '../errors/basemap-error';

interface DeckGLMapOptions {
  basemap?: string;
  view?: {
    bearing?: number;
    latitude?: number;
    longitude?: number;
    pitch?: number;
    zoom?: number;
  };
  container?: HTMLElement | string;
}

const DEFAULT_OPTIONS: DeckGLMapOptions = {
  basemap: 'positron',
  view: {
    bearing: 0,
    latitude: 0,
    longitude: 0,
    pitch: 0,
    zoom: 1
  },
  container: 'map'
};

/**
 * A helper function to create a CARTO basemap on a 'map' DOM element, rendered using *Mapbox GL JS*
 *
 * Examples:
 * ```javascript
 *    // Several options to create the map are allowed
 *    const deckMap = carto.viz.createMap();
 *    const deckMap = carto.viz.createMap({ basemap: 'voyager'});
 *    const deckMap = carto.viz.createMap({ basemap: 'voyager', view: { zoom: 4 } });
 *    const deckMap = carto.viz.createMap({ basemap: 'positron', view: { zoom: 4, longitude: 3, latitude: 40, pitch: 45, bearing: 30 }, container: 'map' });
 * ```
 * @export
 * @param {DeckGLMapOptions} mapOptions
 * @returns
 */
export function createMap(options: DeckGLMapOptions = DEFAULT_OPTIONS) {
  if (!window.deck.DeckGL) {
    throw new CartoBaseMapError(
      'Deck.gl library not found within window context. Please check documentation to know more about how to configure it.'
    );
  }

  const chosenOptions = {
    basemap: options.basemap || DEFAULT_OPTIONS.basemap || 'positron',
    view: { ...DEFAULT_OPTIONS.view, ...options.view },
    container: options.container || DEFAULT_OPTIONS.container
  };

  const deckMap = new (window.deck.DeckGL as any)({
    mapStyle:
      CartoMapStyle[
        chosenOptions.basemap.toUpperCase() as keyof typeof CartoMapStyle
      ],
    initialViewState: chosenOptions.view,
    container: chosenOptions.container,
    controller: true
  });

  return deckMap;
}
