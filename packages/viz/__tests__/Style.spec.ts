// eslint-disable-next-line import/no-unresolved
import { GeoJsonLayerProps } from '@deck.gl/layers/geojson-layer/geojson-layer';
import { Style } from '../src/lib/style/Style';

describe('Style', () => {
  describe('Style creation', () => {
    it('should create a new Style instance properly', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const defaultStyles: GeoJsonLayerProps<any> = {
        getFillColor: [0, 0, 0, 0]
      };

      expect(() => new Style(defaultStyles)).not.toThrow();
    });
  });

  describe('getProperties', () => {
    it('should return style properties', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const styleProperties: GeoJsonLayerProps<any> = {
        getFillColor: [0, 0, 0, 0]
      };

      const styleInstance = new Style(styleProperties);
      console.log('here');
      expect(styleInstance.getProperties()).toMatchObject({
        getFillColor: expect.arrayContaining([0, 0, 0, 0])
      });
    });
  });
});
