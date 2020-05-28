import { Deck } from '@deck.gl/core';
import { colorBinsStyle } from '../../src/lib/style';
import * as mapsResponse from '../data-mocks/maps.number.json';
import { CARTOSource } from '../../src';
import { hexToRgb } from '../../src/lib/style/helpers/utils';
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
    geometryType: 'Polygon',
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

describe('ColorBinsStyle', () => {
  describe('Style creation', () => {
    it('should create a ColorBinsStyle instance properly', () => {
      expect(() => colorBinsStyle('attributeName')).not.toThrow();
    });

    it('should always return a getFillColor function', () => {
      const style = colorBinsStyle(FIELD_NAME);
      const response = style.getProps(styledLayer);
      expect(response).toHaveProperty('getFillColor');
      expect(response.getFillColor).toBeInstanceOf(Function);
    });
  });

  describe('Parameters', () => {
    it('should launch styling error when bins and breaks missmatch', () => {
      const style = colorBinsStyle(FIELD_NAME, {
        breaks: [20, 50],
        bins: 1
      });

      try {
        style.getProps(styledLayer);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });

    it('should launch styling error when breaks and palette missmatch', () => {
      const style = colorBinsStyle(FIELD_NAME, {
        breaks: [20, 50],
        palette: ['#ff0', '#231']
      });

      try {
        style.getProps(styledLayer);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });

    it('should fail with bins less than 1', () => {
      const style = colorBinsStyle(FIELD_NAME, {
        bins: 0
      });

      try {
        style.getProps(styledLayer);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });

    it('should fail with bins greather than 7', () => {
      const style = colorBinsStyle(FIELD_NAME, {
        bins: 8
      });

      try {
        style.getProps(styledLayer);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });

    it('should fail with invalid palette', () => {
      const style = colorBinsStyle(FIELD_NAME, {
        palette: 'unexisting'
      });

      try {
        style.getProps(styledLayer);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });

    it('should fail with invalid nullColor', () => {
      const style = colorBinsStyle(FIELD_NAME, {
        nullColor: '#'
      });

      try {
        style.getProps(styledLayer);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });

    it('should fail with invalid color', () => {
      const style = colorBinsStyle(FIELD_NAME, {
        othersColor: '#'
      });

      try {
        style.getProps(styledLayer);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });
  });

  describe('Data validation', () => {
    describe('Custom breaks', () => {
      const palette = ['#000', '#111', '#222', '#333', '#444', '#555'];
      const nullColor = '#f00';
      const style = colorBinsStyle(FIELD_NAME, {
        breaks: [20, 50, 100, 200, 400],
        palette,
        nullColor
      });
      const getFillColor = style.getProps(styledLayer).getFillColor as (
        d: any
      ) => any;

      it('should assign the right color to feature between intervals', () => {
        const r = getFillColor({ properties: { [FIELD_NAME]: 30 } });
        expect(r).toEqual(hexToRgb(palette[1]));
      });

      it('should assign the right color to feature at the interval point', () => {
        const r = getFillColor({ properties: { [FIELD_NAME]: 50 } });
        expect(r).toEqual(hexToRgb(palette[2]));
      });

      it('should assign the right color to feature negative', () => {
        const r = getFillColor({ properties: { [FIELD_NAME]: -1 } });
        expect(r).toEqual(hexToRgb(palette[0]));
      });

      it('should assign the right color to feature higher than upper limit', () => {
        const r = getFillColor({ properties: { [FIELD_NAME]: 500 } });
        expect(r).toEqual(hexToRgb(palette[5]));
      });

      it('should assign the right color to a null feature', () => {
        const r = getFillColor({ properties: { [FIELD_NAME]: null } });
        expect(r).toEqual(hexToRgb(nullColor));
      });
    });

    describe('With defaults', () => {
      const palette = ['#000', '#111', '#222', '#333', '#444'];
      const style = colorBinsStyle(FIELD_NAME, { palette });
      const getFillColor = style.getProps(styledLayer).getFillColor as (
        d: any
      ) => any;

      it('should assign the right color to feature using dynamic breaks', () => {
        const r = getFillColor({ properties: { [FIELD_NAME]: stats.avg } });
        expect(r).toEqual(hexToRgb(palette[2]));
      });

      it('should assign the right color to the max', () => {
        const r = getFillColor({ properties: { [FIELD_NAME]: stats.max } });
        expect(r).toEqual(hexToRgb(palette[4]));
      });

      it('should assign the right color to the min', () => {
        const r = getFillColor({ properties: { [FIELD_NAME]: stats.min } });
        expect(r).toEqual(hexToRgb(palette[0]));
      });
    });
  });
});
