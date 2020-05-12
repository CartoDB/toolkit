import { Deck } from '@deck.gl/core';
import { colorCategoriesStyle, defaultStyles } from '../src/lib/style';
import * as mapsResponse from './data-mocks/maps.category.json';
import { CARTOSource } from '../src';
// import { parseGeometryType } from '../src/lib/style/helpers/utils';
import { CartoStylingError } from '../src/lib/errors/styling-error';
import { hexToRgb, getColors } from '../src/lib/style/helpers/utils';

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
    it('should create a ColorBinsStyle instance properly', () => {
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
    it('should launch styling error when categories and palette missmatch', () => {
      const style = colorCategoriesStyle(FIELD_NAME, {
        categories: ['uno'],
        palette: ['#ff0', '#231']
      });
      expect(() => style.getLayerProps(styledLayer)).toThrow(CartoStylingError);
    });
  });

  describe('Data validation', () => {
    const categories = ['Moda y calzado', 'Bares y restaurantes', 'Salud'];
    const palette = ['#000', '#111', '#222'];
    const nullColor = '#f00';
    const othersColor = '#00f';

    const style = colorCategoriesStyle(FIELD_NAME, {
      categories,
      palette,
      nullColor,
      othersColor
    });

    let getFillColor = style.getLayerProps(styledLayer).getFillColor as (
      d: any
    ) => any;

    it('should assign the right color to a category', () => {
      const r = getFillColor({ properties: { [FIELD_NAME]: categories[0] } });
      expect(r).toEqual(hexToRgb(palette[0]));
    });

    it('should assign the right color to others', () => {
      const r = getFillColor({
        properties: { [FIELD_NAME]: 'Cuidado personal' }
      });
      expect(r).toEqual(hexToRgb(othersColor));
    });

    it('should assign the right color to a null feature', () => {
      const r = getFillColor({ properties: { [FIELD_NAME]: null } });
      expect(r).toEqual(hexToRgb(nullColor));
    });

    it('should assign the right color to feature using dynamic categories', () => {
      const defaultPalette = defaultStyles.Point.palette;
      const colors = getColors(defaultPalette, defaultPalette.length);
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
