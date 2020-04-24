import { Credentials, defaultCredentials, setDefaultCredentials } from '@carto/toolkit-core';
import { MVTLayer } from '@deck.gl/geo-layers';
import { Layer } from '../src/lib/Layer';

const DEFAULT_DATASET = 'default_dataset';
const TEST_CREDENTIALS = {
  username: 'test_username',
  apiKey: 'default_public',
  serverUrlTemplate: 'https://{user}.example.com'
};

const instantiationMapResult = {
  metadata: {
    layers: [{
      meta: {
        stats: {
          geometryType: 'ST_Polygon'
        }
      }
    }],
    url: {
      vector: {
        subdomains: ['a', 'b', 'c'],
        urlTemplate: 'https://{s}.cartocdn.net/username/api/v1/map/map_id/layer0/{z}/{x}/{y}.mvt?api_key=default_public'
      }
    }
  }
};

const instantiateMapFrom = jest.fn().mockImplementation(
  () => Promise.resolve(instantiationMapResult)
);

jest.mock('@carto/toolkit-maps', () => (
  {
    Maps: jest.fn().mockImplementation(() => ({ instantiateMapFrom }))
  }
));

describe('Layer', () => {
  describe('Layer creation', () => {
    it('should create a new Layer instance properly', () => {
      expect(() => new Layer(DEFAULT_DATASET)).not.toThrow();
    });
  });

  describe('Credentials', () => {
    beforeEach(() => {
      setDefaultCredentials({ ...TEST_CREDENTIALS });
    });

    it('should use provided credentials', () => {
      const credentials = new Credentials(
        'not_default_username',
        'not_default_apikey',
        'https://notdefaultserver.com'
      );

      const layer = new Layer(DEFAULT_DATASET, {}, { credentials });

      const layerCredentials = layer.credentials;
      expect(layerCredentials).toBe(credentials);
    });

    it('should use default credentials if not provided', () => {
      const layer = new Layer(DEFAULT_DATASET);

      const layerCredentials = layer.credentials;
      expect(layerCredentials).toBe(defaultCredentials);
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

        expect(setProps).toHaveBeenCalledWith(
          expect.objectContaining({
            layers: expect.arrayContaining([expect.any(MVTLayer)])
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
