import { Deck } from '@deck.gl/core';
import { colorBinsStyle } from '../src/lib/style';
import * as mapsResponse from './data-mocks/maps.number.json';
import { CARTOSource } from '../src';
import { hexToRgb } from '../src/lib/style/helpers/utils';
import { CartoStylingError } from '../src/lib/errors/styling-error';

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

jest.mock('../src', () => ({
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
      const response = style.getLayerProps(styledLayer);
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
      expect(() => style.getLayerProps(styledLayer)).toThrow(CartoStylingError);
    });

    it('should launch styling error when breaks and palette missmatch', () => {
      const style = colorBinsStyle(FIELD_NAME, {
        breaks: [20, 50],
        palette: ['#ff0', '#231']
      });
      expect(() => style.getLayerProps(styledLayer)).toThrow(CartoStylingError);
    });
  });

  describe('Data validation', () => {
    const palette = ['#000', '#111', '#222', '#333', '#444', '#555'];
    const nullColor = '#f00';
    const style = colorBinsStyle(FIELD_NAME, {
      breaks: [20, 50, 100, 200, 400],
      palette,
      nullColor
    });
    let getFillColor = style.getLayerProps(styledLayer).getFillColor as (
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

    it('should assign the right color to feature using dynamic breaks', () => {
      const response = colorBinsStyle(FIELD_NAME).getLayerProps(styledLayer);
      getFillColor = response.getFillColor as (d: any) => any;
      const r = getFillColor({ properties: { [FIELD_NAME]: 100 } });
      expect(r).toEqual([4, 82, 117, 255]);
    });
  });
});
