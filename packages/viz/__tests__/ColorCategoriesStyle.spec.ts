import { Deck } from '@deck.gl/core';
import { colorCategoriesStyle } from '../src/lib/style';
import * as mapsResponse from './data-mocks/maps.category.json';
import { CARTOSource } from '../src';
import { CartoStylingError } from '../src/lib/errors/styling-error';
import { hexToRgb, getColors } from '../src/lib/style/helpers/utils';
import { DEFAULT_PALETTE } from '../src/lib/style/helpers/color-categories-style';

const FIELD_NAME = 'category';
const mapStats = mapsResponse.metadata.layers[0].meta.stats;

const getMetadata = jest.fn().mockImplementation(() => {
  return {
    geometryType: 'Point',
    stats: [
      {
        name: FIELD_NAME,
        categories: mapStats.columns[FIELD_NAME].categories
      }
    ]
  };
});

jest.mock('../src', () => ({
  CARTOSource: jest.fn().mockImplementation(() => ({ getMetadata }))
}));

const styledLayer = {
  getMapInstance: () => ({} as Deck),
  source: new CARTOSource('table')
};

describe('ColorCategoriesStyle', () => {
  describe('Style creation', () => {
    it('should create a colorCategoriesStyle properly', () => {
      expect(() => colorCategoriesStyle('attributeName')).not.toThrow();
    });

    it('should always return a getFillColor function', () => {
      const style = colorCategoriesStyle(FIELD_NAME);
      const response = style.getLayerProps(styledLayer);
      expect(response).toHaveProperty('getFillColor');
      expect(response.getFillColor).toBeInstanceOf(Function);
    });
  });

  describe('Parameters', () => {
    it('should launch styling error when categories and palette size missmatch', () => {
      const style = colorCategoriesStyle(FIELD_NAME, {
        categories: ['uno'],
        palette: ['#ff0', '#231']
      });
      expect(() => style.getLayerProps(styledLayer)).toThrow(CartoStylingError);
    });

    it('should not launch styling error if palette is a cartocolor and it can fit the categories size', () => {
      const style = colorCategoriesStyle(FIELD_NAME, {
        categories: ['one', 'two', 'three'],
        palette: 'prism'
      });
      expect(() => style.getLayerProps(styledLayer)).not.toThrow(
        CartoStylingError
      );
    });

    it('should fails with invalid top', () => {
      const style = colorCategoriesStyle(FIELD_NAME, {
        top: 0
      });
      expect(() => style.getLayerProps(styledLayer)).toThrow(CartoStylingError);
    });

    it('should fails with invalid palette', () => {
      const style = colorCategoriesStyle(FIELD_NAME, {
        palette: 'unexisting'
      });
      expect(() => style.getLayerProps(styledLayer)).toThrow(CartoStylingError);
    });
  });

  describe('Data validation', () => {
    const opts = {
      categories: ['Moda y calzado', 'Bares y restaurantes', 'Salud'],
      palette: ['#000', '#111', '#222'],
      nullColor: '#f00',
      othersColor: '#00f'
    };

    const style = colorCategoriesStyle(FIELD_NAME, opts);

    let getFillColor = style.getLayerProps(styledLayer).getFillColor as (
      d: any
    ) => any;

    it('should assign the right color to a category', () => {
      const r = getFillColor({
        properties: { [FIELD_NAME]: opts.categories[0] }
      });
      expect(r).toEqual(hexToRgb(opts.palette[0]));
    });

    it('should assign the right color to others', () => {
      const r = getFillColor({
        properties: { [FIELD_NAME]: 'Cuidado personal' }
      });
      expect(r).toEqual(hexToRgb(opts.othersColor));
    });

    it('should assign the right color to a null feature', () => {
      const r = getFillColor({ properties: { [FIELD_NAME]: null } });
      expect(r).toEqual(hexToRgb(opts.nullColor));
    });

    it('should assign the right color when top defined', () => {
      const top = 1;
      const s = colorCategoriesStyle(FIELD_NAME, { ...opts, top });

      getFillColor = s.getLayerProps(styledLayer).getFillColor as (
        d: any
      ) => any;

      const r = getFillColor({
        properties: { [FIELD_NAME]: 'Bares y restaurantes' }
      });
      expect(r).toEqual(hexToRgb(opts.othersColor));
    });

    it('should assign the right color to feature using dynamic categories', () => {
      const colors = getColors(DEFAULT_PALETTE, 5);
      const response = colorCategoriesStyle(FIELD_NAME).getLayerProps(
        styledLayer
      );
      getFillColor = response.getFillColor as (d: any) => any;
      const r = getFillColor({
        properties: { [FIELD_NAME]: 'Moda y calzado' }
      });
      expect(r).toEqual(hexToRgb(colors[0]));
    });
  });
});
