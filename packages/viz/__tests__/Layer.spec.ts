import { log, Deck } from '@deck.gl/core';
import { Layer } from '../src/lib/layer/Layer';
import { getStyles } from '../src/lib/style';

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

const stylesDefault = getStyles('Polygon');

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
        await layer.addTo((deckInstance as unknown) as Deck);

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
        ...stylesDefault,
        data
      };

      const layer = new Layer(DEFAULT_DATASET);
      const deckGLLayer = await layer.getDeckGLLayer();
      expect(deckGLLayer.props).toMatchObject(defaultProperties);
    });

    it('should return default style properties plus the ones overriden', async () => {
      const layerProperties = {
        ...stylesDefault,
        data,
        getFillColor: [128, 128, 128]
      };

      const layer = new Layer(DEFAULT_DATASET, {
        getFillColor: [128, 128, 128]
      });

      const deckGLLayer = await layer.getDeckGLLayer();
      expect(deckGLLayer.props).toMatchObject(layerProperties);
    });
  });
});
