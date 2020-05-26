/* eslint-disable no-restricted-syntax */

import {
  colorValidation,
  sizeRangeValidation
} from '../../src/lib/style/validators';
import { getStyles } from '../../src/lib/style/deck-styles';
import { CartoStylingError } from '../../src/lib/errors/styling-error';

describe('Validators', () => {
  describe('colorValidation', () => {
    it('fails with invalid colors', () => {
      const colors = [
        '',
        '#',
        '#12',
        '#1234',
        '#12345',
        '#1234567',
        '#123456789',
        '#000000W'
      ];

      for (const color of colors) {
        expect(colorValidation(color)).toBe(false);
      }
    });

    it('works with valid colors', () => {
      const colors = ['#123456', '#FFF', '#000000FF'];

      for (const color of colors) {
        expect(colorValidation(color)).toBe(true);
      }
    });
  });

  describe('sizeRangeValidation', () => {
    it('fails with invalid ranges', () => {
      const ranges = [[], [1], [0, 0], [0, 1], [1, 1], [2, 1], [-1, 1]];

      for (const range of ranges) {
        expect(sizeRangeValidation(range)).toBe(false);
      }
    });

    it('works with valid ranges', () => {
      const ranges = [[1, 10]];

      for (const range of ranges) {
        expect(sizeRangeValidation(range)).toBe(true);
      }
    });
  });

  describe('validateBasicParameters', () => {
    const geometryType = 'Point';
    const validColor = '#000000';
    const invalidColor = '#';

    it('fails with invalid color', () => {
      const options = {
        color: invalidColor,
        size: 1,
        opacity: 1,
        strokeColor: validColor,
        strokeWidth: 1
      };

      try {
        getStyles(geometryType, options);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });

    it('fails with size smaller than 1', () => {
      const options = {
        color: validColor,
        size: 0,
        opacity: 1,
        strokeColor: validColor,
        strokeWidth: 1
      };

      try {
        getStyles(geometryType, options);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });

    it('fails with opacity smaller than 0', () => {
      const options = {
        color: validColor,
        size: 1,
        opacity: -1,
        strokeColor: validColor,
        strokeWidth: 1
      };

      try {
        getStyles(geometryType, options);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });

    it('fails with opacity greather than 1', () => {
      const options = {
        color: validColor,
        size: 1,
        opacity: 1.1,
        strokeColor: validColor,
        strokeWidth: 1
      };

      try {
        getStyles(geometryType, options);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });

    it('fails with invalid strokeColor', () => {
      const options = {
        color: validColor,
        size: 1,
        opacity: 1,
        strokeColor: invalidColor,
        strokeWidth: 1
      };

      expect(() => getStyles(geometryType, options)).toThrow(CartoStylingError);
    });

    it('fails with strokeWidth smaller than 0', () => {
      const options = {
        color: validColor,
        size: 1,
        opacity: 1,
        strokeColor: validColor,
        strokeWidth: -1
      };

      try {
        getStyles(geometryType, options);
      } catch (error) {
        expect(error).toBeInstanceOf(CartoStylingError);
      }
    });

    it('works with values in the limit', () => {
      const options = {
        color: '#000',
        size: 1,
        opacity: 0,
        strokeColor: '#FFFFFFFF',
        strokeWidth: 0
      };

      const style = getStyles(geometryType, options);
      expect(style).toBeTruthy();
    });
  });
});
