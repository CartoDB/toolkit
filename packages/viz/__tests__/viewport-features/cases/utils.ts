import { Deck } from '@deck.gl/core';

export function createDeckInstance(overrideProps = {}) {
  return new Deck({
    width: '100%',
    height: '100%',
    layers: [],
    effects: [],
    ...overrideProps
  });
}

export function createFakeLayerWithSelectedTiles(
  tiles: Record<string, GeoJSON.Feature[]>[]
) {
  return {
    state: {
      tileset: {
        selectedTiles: tiles
      }
    }
  };
}

export function createFakeDeckGlInstance(options: Record<string, unknown>) {
  const { viewports = [] } = options;

  return {
    getViewports() {
      return viewports;
    }
  };
}

export function createViewport(options: Record<string, unknown>) {
  const { frustumPlanes = {} } = options;
  return {
    getFrustumPlanes() {
      return frustumPlanes;
    }
  };
}
