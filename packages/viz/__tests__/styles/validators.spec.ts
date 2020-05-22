/* eslint-disable no-restricted-syntax */

import { colorValidation } from '../../src/lib/style/helpers/validators';

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
});
