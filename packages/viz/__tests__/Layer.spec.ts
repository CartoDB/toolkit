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
    let deckInstanceMock: Deck;

    beforeEach(() => {
      const deck = {
        props: {
          layers: []
        },
        setProps: null as unknown
      };
      deck.setProps = jest.fn().mockImplementation(props => {
        deck.props = { ...props };
      });

      deckInstanceMock = (deck as unknown) as Deck;
    });

    describe('.addTo', () => {
      it('should add the created Deck.gl layer to the provided instance', async () => {
        const layer = new Layer(DEFAULT_DATASET);
        await layer.addTo(deckInstanceMock);

        const deckGLLayer = await layer.getDeckGLLayer();
        expect(deckInstanceMock.setProps).toHaveBeenCalledWith(
          expect.objectContaining({
            layers: expect.arrayContaining([deckGLLayer])
          })
        );
      });

      it('should respect the order when updating a layer', async () => {
        const layer1 = new Layer(DEFAULT_DATASET, {}, { id: 'layer1' });
        await layer1.addTo(deckInstanceMock);

        const layer2 = new Layer(DEFAULT_DATASET, {}, { id: 'layer2' });
        await layer2.addTo(deckInstanceMock);

        await layer1.replaceDeckGLLayer();
        expect(deckInstanceMock.props.layers.length).toBe(2);
        expect(deckInstanceMock.props.layers[0].id).toBe('layer1');
        expect(deckInstanceMock.props.layers[1].id).toBe('layer2');
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
