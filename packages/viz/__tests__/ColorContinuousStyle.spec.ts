import { Deck } from '@deck.gl/core';
import { scale as chromaScale } from 'chroma-js';
import { colorContinuousStyle } from '../src/lib/style';
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

describe('ColorContinuousStyle', () => {
  describe('Style creation', () => {
    it('should create a ColorContinuousStyle instance properly', () => {
      expect(() => colorContinuousStyle('attributeName')).not.toThrow();
    });

    it('should always return a getFillColor function', () => {
      const style = colorContinuousStyle(FIELD_NAME);
      const response = style.getLayerProps(styledLayer);
      expect(response).toHaveProperty('getFillColor');
      expect(response.getFillColor).toBeInstanceOf(Function);
    });
  });

  describe('Paramters', () => {
    it('should fails with invalid palette', () => {
      const style = colorContinuousStyle(FIELD_NAME, {
        palette: 'unexisting'
      });
      expect(() => style.getLayerProps(styledLayer)).toThrow(CartoStylingError);
    });

    it('should fails with invalid ranges', () => {
      const style = colorContinuousStyle(FIELD_NAME, {
        rangeMin: 1,
        rangeMax: 1
      });
      expect(() => style.getLayerProps(styledLayer)).toThrow(CartoStylingError);
    });
  });

  describe('Data validation', () => {
    const opts = {
      palette: ['#f00', '#00f'],
      nullColor: '#0f0'
    };
    const style = colorContinuousStyle(FIELD_NAME, opts);
    let getFillColor = style.getLayerProps(styledLayer).getFillColor as (
      d: any
    ) => any;

    it('should assign the right color to a feature', () => {
      const featureValue = 30;
      const r = getFillColor({ properties: { [FIELD_NAME]: featureValue } });

      const expectedColor = chromaScale([opts.palette[0], opts.palette[1]])
        .domain([stats.min, stats.max])
        .mode('lrgb')(featureValue)
        .rgb();

      expect(r).toEqual(expectedColor);
    });

    it('should assign the right color to a null feature', () => {
      const r = getFillColor({ properties: { [FIELD_NAME]: null } });
      expect(r).toEqual(hexToRgb(opts.nullColor));
    });

    it('should assign the right color to a feature using ranges', () => {
      const rangeMin = 0;
      const rangeMax = 100;
      const featureValue = 30;
      const s = colorContinuousStyle(FIELD_NAME, {
        ...opts,
        rangeMin,
        rangeMax
      });
      getFillColor = s.getLayerProps(styledLayer).getFillColor as (
        d: any
      ) => any;

      const expectedColor = chromaScale([opts.palette[0], opts.palette[1]])
        .domain([rangeMin, rangeMax])
        .mode('lrgb')(featureValue)
        .rgb();

      const r = getFillColor({ properties: { [FIELD_NAME]: featureValue } });
      expect(r).toEqual(expectedColor);
    });
  });
});
