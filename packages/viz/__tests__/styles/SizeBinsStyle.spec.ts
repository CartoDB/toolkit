import { Deck } from '@deck.gl/core';
import { sizeBinsStyle, defaultStyles } from '../../src/lib/style';
import * as mapsResponse from '../data-mocks/maps.number.json';
import { CARTOSource } from '../../src';
import { ClassificationMethod } from '../../src/lib/utils/Classifier';
import { CartoStylingError } from '../../src/lib/errors/styling-error';

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

jest.mock('../../src', () => ({
  CARTOSource: jest.fn().mockImplementation(() => ({ getMetadata }))
}));

const styledLayer = {
  getMapInstance: () => ({} as Deck),
  source: new CARTOSource('table')
};

describe('SizeBinsStyle', () => {
  describe('Style creation', () => {
    it('should create a sizeBinsStyle instance properly', () => {
      expect(() => sizeBinsStyle('attributeName')).not.toThrow();
    });

    it('should always return the right propertie for points', () => {
      const style = sizeBinsStyle(FIELD_NAME);
      const response = style.getLayerProps(styledLayer);
      expect(response).toHaveProperty('getRadius');
      expect(response.getRadius).toBeInstanceOf(Function);
      expect(response).toHaveProperty('radiusUnits', 'pixels');
      expect(response).toHaveProperty('pointRadiusMinPixels');
      expect(response).toHaveProperty('pointRadiusMaxPixels');
      const minSize = defaultStyles.Point.sizeRange[0];
      const maxSize = defaultStyles.Point.sizeRange[1];
      expect(response.pointRadiusMinPixels).toBeGreaterThanOrEqual(minSize);
      expect(response.pointRadiusMaxPixels).toBeLessThanOrEqual(maxSize);
    });
  });

  describe('Parameters', () => {
    it('should launch styling error when bins and breaks missmatch', () => {
      const style = sizeBinsStyle(FIELD_NAME, {
        breaks: [20, 50],
        bins: 1
      });

      try {
        style.getLayerProps(styledLayer);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });

    it('should fail with biss less than 1', () => {
      const style = sizeBinsStyle(FIELD_NAME, {
        bins: 0
      });

      try {
        style.getLayerProps(styledLayer);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });

    it('should fail with bins greather than 7', () => {
      const style = sizeBinsStyle(FIELD_NAME, {
        bins: 8
      });

      try {
        style.getLayerProps(styledLayer);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });

    it('should fail with invalid size ranges length', () => {
      const style = sizeBinsStyle(FIELD_NAME, {
        sizeRange: []
      });

      try {
        style.getLayerProps(styledLayer);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });

    it('should fail with invalid size ranges value', () => {
      const style = sizeBinsStyle(FIELD_NAME, {
        sizeRange: [-1, 10]
      });

      try {
        style.getLayerProps(styledLayer);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });

    it('should fail with invalid size ranges values', () => {
      const style = sizeBinsStyle(FIELD_NAME, {
        sizeRange: [2, 1]
      });

      try {
        style.getLayerProps(styledLayer);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });

    it('should fail with invalid nullSize', () => {
      const style = sizeBinsStyle(FIELD_NAME, {
        nullSize: -1
      });

      try {
        style.getLayerProps(styledLayer);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });
  });

  describe('Data validation', () => {
    const opts = {
      breaks: [2, 4, 8, 10, 12],
      method: 'equal' as ClassificationMethod,
      sizeRange: [2, 12]
    };
    const style = sizeBinsStyle(FIELD_NAME, opts);
    const getRadius = style.getLayerProps(styledLayer).getRadius as (
      d: any
    ) => any;

    it('should assign the maximum size to a value at the upper limit', () => {
      const fv = opts.sizeRange[1];
      const r = getRadius({ properties: { [FIELD_NAME]: fv } });
      expect(r).toEqual(fv);
    });

    it('should assign the maximun size to a maximum value', () => {
      const fv = 100;
      const r = getRadius({ properties: { [FIELD_NAME]: fv } });
      expect(r).toEqual(opts.sizeRange[1]);
    });

    it('should assign the right size to a value at the lower limit', () => {
      const fv = 2;
      // expected at bucket 1
      const r = getRadius({ properties: { [FIELD_NAME]: fv } });
      expect(r).toEqual(4);
    });

    it('should assign the right size to a value equal to 0', () => {
      const fv = 0;
      const r = getRadius({ properties: { [FIELD_NAME]: fv } });
      expect(r).toEqual(opts.sizeRange[0]);
    });

    it('should assign the right size to a value between breaks', () => {
      const fv = 3;
      const r = getRadius({ properties: { [FIELD_NAME]: fv } });
      expect(r).toEqual(4);
    });

    it('should assign the right size to a negative value', () => {
      const fv = -1;
      const r = getRadius({ properties: { [FIELD_NAME]: fv } });
      expect(r).toEqual(opts.sizeRange[0]);
    });

    it('should assign the right size to feature using dynamic breaks', () => {
      const s = sizeBinsStyle(FIELD_NAME);

      const getRadiusFn = s.getLayerProps(styledLayer).getRadius as (
        d: any
      ) => any;

      let r = getRadiusFn({ properties: { [FIELD_NAME]: stats.max } });
      expect(r).toEqual(defaultStyles.Point.sizeRange[1]);
      r = getRadiusFn({ properties: { [FIELD_NAME]: stats.avg } });
      expect(r).toEqual(8);
      r = getRadiusFn({ properties: { [FIELD_NAME]: stats.min } });
      expect(r).toEqual(defaultStyles.Point.sizeRange[0]);
    });
  });
});
