import { Deck } from '@deck.gl/core';
import * as mapsResponse from '../data-mocks/maps.category.json';
import { sizeCategoriesStyle } from '../../src/lib/style';
import { CARTOSource } from '../../src';
import { defaultStyles } from '../../src/lib/style/default-styles';
import { CartoStylingError } from '../../src/lib/errors/styling-error';

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

jest.mock('../../src', () => ({
  CARTOSource: jest.fn().mockImplementation(() => ({ getMetadata }))
}));

jest.mock('../../src/lib/style/layer-style', () => ({
  pixel2meters: jest.fn().mockImplementation(v => v)
}));

const styledLayer = {
  getMapInstance: () => ({} as Deck),
  source: new CARTOSource('table')
};

describe('SizeCategoriesStyle', () => {
  describe('Style creation', () => {
    it('should create a sizeCategoriesStyle instance properly', () => {
      expect(() => sizeCategoriesStyle(FIELD_NAME)).not.toThrow();
    });

    it('should always return the right propertie for points', () => {
      const style = sizeCategoriesStyle(FIELD_NAME);
      const response = style.getProps(styledLayer);
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
    it('should fail with top less than 1', () => {
      const style = sizeCategoriesStyle(FIELD_NAME, {
        top: 0
      });

      try {
        style.getProps(styledLayer);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });

    it('should fail with top greather than 12', () => {
      const style = sizeCategoriesStyle(FIELD_NAME, {
        top: 13
      });

      try {
        style.getProps(styledLayer);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });

    it('should fail with invalid size ranges length', () => {
      const style = sizeCategoriesStyle(FIELD_NAME, {
        sizeRange: []
      });

      try {
        style.getProps(styledLayer);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });

    it('should fail with invalid size ranges value', () => {
      const style = sizeCategoriesStyle(FIELD_NAME, {
        sizeRange: [-1, 10]
      });

      try {
        style.getProps(styledLayer);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });

    it('should fail with invalid size ranges values', () => {
      const style = sizeCategoriesStyle(FIELD_NAME, {
        sizeRange: [2, 1]
      });

      try {
        style.getProps(styledLayer);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });

    it('should fail with invalid nullSize', () => {
      const style = sizeCategoriesStyle(FIELD_NAME, {
        nullSize: -1
      });

      try {
        style.getProps(styledLayer);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });
  });

  describe('Data validation', () => {
    const opts = {
      categories: ['Moda y calzado', 'Bares y restaurantes', 'Salud'],
      sizeRange: [2, 10]
    };

    const style = sizeCategoriesStyle(FIELD_NAME, opts);

    let getRadius = style.getProps(styledLayer).getRadius as (d: any) => any;

    it('should assign the right size to each category', () => {
      let r = getRadius({
        properties: { [FIELD_NAME]: opts.categories[0] }
      });
      expect(r).toEqual(opts.sizeRange[0]);

      r = getRadius({
        properties: { [FIELD_NAME]: opts.categories[1] }
      });

      expect(r).toEqual(6);

      r = getRadius({
        properties: { [FIELD_NAME]: opts.categories[2] }
      });
      expect(r).toEqual(opts.sizeRange[1]);
    });

    it('should assign the right size to the first category', () => {
      const r = getRadius({
        properties: { [FIELD_NAME]: opts.categories[0] }
      });
      expect(r).toEqual(2);
    });

    it('should assign the right color to feature using dynamic categories', () => {
      const response = sizeCategoriesStyle(FIELD_NAME).getProps(styledLayer);
      getRadius = response.getRadius as (d: any) => any;
      let r = getRadius({
        properties: { [FIELD_NAME]: opts.categories[0] }
      });
      expect(r).toEqual(defaultStyles.Point.sizeRange[0]);

      r = getRadius({
        properties: { [FIELD_NAME]: opts.categories[2] }
      });
      expect(r).toEqual(4.4);
    });
  });
});
