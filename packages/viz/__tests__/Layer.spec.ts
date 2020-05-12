import { log } from '@deck.gl/core';
import { Layer } from '../src/lib/Layer';

const DEFAULT_DATASET = 'default_dataset';

// Set Deck. level for debug
log.level = 1;

const instantiationMapResult = {
  metadata: {
    layers: [
      {
        meta: {
          stats: {
            geometryType: 'ST_Polygon'
          }
        }
      }
    ],
    url: {
      vector: {
        subdomains: ['a', 'b', 'c'],
        urlTemplate:
          'https://{s}.cartocdn.net/username/api/v1/map/map_id/layer0/{z}/{x}/{y}.mvt?api_key=default_public'
      }
    }
  }
};

const instantiateMapFrom = jest
  .fn()
  .mockImplementation(() => Promise.resolve(instantiationMapResult));

jest.mock('@carto/toolkit-maps', () => ({
  Maps: jest.fn().mockImplementation(() => ({ instantiateMapFrom }))
}));

describe('Layer', () => {
  describe('Layer creation', () => {
    it('should create a new Layer instance properly', () => {
      expect(() => new Layer(DEFAULT_DATASET)).not.toThrow();
    });
  });

  describe('Deck.gl integration', () => {
    describe('.addTo', () => {
      it('should add the created Deck.gl layer to the provided instance', async () => {
        const setProps = jest.fn();
        const deckInstance = {
          props: {
            layers: []
          },
          setProps
        };

        const layer = new Layer(DEFAULT_DATASET);
        await layer.addTo(deckInstance);

        const deckGLLayer = await layer.getDeckGLLayer();
        expect(setProps).toHaveBeenCalledWith(
          expect.objectContaining({
            layers: expect.arrayContaining([deckGLLayer])
          })
        );
      });
    });
  });

  describe('.getDeckGLLayer', () => {
    const data = [
      'https://a.cartocdn.net/username/api/v1/map/map_id/layer0/{z}/{x}/{y}.mvt?api_key=default_public',
      'https://b.cartocdn.net/username/api/v1/map/map_id/layer0/{z}/{x}/{y}.mvt?api_key=default_public',
      'https://c.cartocdn.net/username/api/v1/map/map_id/layer0/{z}/{x}/{y}.mvt?api_key=default_public'
    ];

    it('should return default style properties in MVTLayer', async () => {
      const defaultProperties = {
        getLineColor: [44, 44, 44],
        getFillColor: [130, 109, 186, 255],
        lineWidthMinPixels: 1,
        data
      };

      const layer = new Layer(DEFAULT_DATASET);
      const deckGLLayer = await layer.getDeckGLLayer();

      expect(deckGLLayer.props).toMatchObject(defaultProperties);
    });

    it('should return default style properties plus the ones overriden', async () => {
      const layerProperties = {
        getLineColor: [44, 44, 44],
        getFillColor: [128, 128, 128],
        lineWidthMinPixels: 1,
        data
      };

      const layer = new Layer(DEFAULT_DATASET, {
        getFillColor: [128, 128, 128]
      });

      const deckGLLayer = await layer.getDeckGLLayer();
      expect(deckGLLayer.props).toMatchObject(layerProperties);
    });
  });
});
