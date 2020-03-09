import { GeoJsonLayerProps } from '@deck.gl/layers/geojson-layer/geojson-layer';
import Style from '../src/lib/style/Style';

describe('Style', () => {
  describe('Style creation', () => {
    it('should create a new Style instance properly', () => {
      const defaultStyles: GeoJsonLayerProps<any> = {
        getFillColor: [0, 0, 0, 0]
      };

      expect(() => new Style(defaultStyles)).not.toThrow();
    });
  });

  describe('getProperties', () => {
    it('should return style properties', () => {
      const styleProperties: GeoJsonLayerProps<any> = {
        getFillColor: [0, 0, 0, 0]
      };

      const styleInstance = new Style(styleProperties);

      expect(styleInstance.getProperties()).toMatchObject({
        getFillColor: expect.arrayContaining([ 0, 0, 0, 0 ])
      });
    });
  });
});
