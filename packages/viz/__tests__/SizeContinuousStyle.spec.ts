import { Deck } from '@deck.gl/core';
import { sizeContinuousStyle } from '../src/lib/style';
import { getDefaultSizeRange } from '../src/lib/style/helpers/size-continuous-style';
import * as mapsResponse from './data-mocks/maps.number.json';
import { CARTOSource } from '../src';

const FIELD_NAME = 'pct_higher_ed';
const mapStats = mapsResponse.metadata.layers[0].meta.stats;
const sample = mapStats.sample.map(s => s.pct_higher_ed);
const stats = {
  name: FIELD_NAME,
  ...mapStats.columns.pct_higher_ed,
  sample
};
const getMetadata = jest.fn().mockImplementation(() => {
  return {
    geometryType: 'Point',
    stats: [stats]
  };
});

jest.mock('../src', () => ({
  CARTOSource: jest.fn().mockImplementation(() => ({ getMetadata }))
}));

jest.mock('../src/lib/style/layer-style', () => ({
  pixel2meters: jest.fn().mockImplementation(v => v)
}));

const styledLayer = {
  getMapInstance: () => ({} as Deck),
  source: new CARTOSource('table')
};

describe('SizeContinuousStyle', () => {
  describe('Style creation', () => {
    it('should create a ColorContinuousStyle instance properly', () => {
      expect(() => sizeContinuousStyle(FIELD_NAME)).not.toThrow();
    });

    it('should always return the right propertie for points', () => {
      const style = sizeContinuousStyle(FIELD_NAME);
      const response = style.getLayerProps(styledLayer);
      expect(response).toHaveProperty('getRadius');
      expect(response.getRadius).toBeInstanceOf(Function);
      expect(response).toHaveProperty('radiusUnits', 'pixels');
      expect(response).toHaveProperty('pointRadiusMinPixels');
      expect(response).toHaveProperty('pointRadiusMaxPixels');
      const [minSize, maxSize] = getDefaultSizeRange('Point');
      expect(response.pointRadiusMinPixels).toBeGreaterThanOrEqual(minSize);
      expect(response.pointRadiusMaxPixels).toBeLessThanOrEqual(maxSize);
    });
  });

  describe('Data validation', () => {
    const opts = {
      sizeRange: [2, 14]
    };

    const style = sizeContinuousStyle(FIELD_NAME, opts);
    let getRadius = style.getLayerProps(styledLayer).getRadius as (
      d: any
    ) => any;

    it('should assign the right size to a feature', () => {
      let r = getRadius({ properties: { [FIELD_NAME]: stats.max } });
      expect(r).toEqual(opts.sizeRange[1]);

      r = getRadius({ properties: { [FIELD_NAME]: stats.min } });
      expect(r).toEqual(opts.sizeRange[0]);

      r = getRadius({ properties: { [FIELD_NAME]: stats.avg } });
      expect(r).toBeCloseTo(7.19);
    });

    it('should assign the right size to a null feature', () => {
      const r = getRadius({ properties: { [FIELD_NAME]: null } });
      expect(r).toEqual(0);
    });

    it('should assign the right color to a feature using ranges', () => {
      const rangeMin = 0;
      const rangeMax = 100;
      const featureValue = 30;
      const s = sizeContinuousStyle(FIELD_NAME, {
        ...opts,
        rangeMin,
        rangeMax
      });
      getRadius = s.getLayerProps(styledLayer).getRadius as (d: any) => any;

      const r = getRadius({ properties: { [FIELD_NAME]: featureValue } });
      expect(r).toEqual(5.6);
    });
    // });
  });
});
