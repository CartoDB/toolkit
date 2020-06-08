/* eslint-disable no-restricted-syntax */

import { hexToRgb } from '../../src/lib/style/helpers/utils';

describe('style helpers utils', () => {
  describe('hexToRgb', () => {
    it('should return proper RGBAColor', () => {
      const testCases = [
        { hex: '#000000', rgb: [0, 0, 0, 255] },
        { hex: '#FFFFFF', rgb: [255, 255, 255, 255] },
        { hex: '#FF0000', rgb: [255, 0, 0, 255] },
        { hex: '#000', rgb: [0, 0, 0, 255] },
        { hex: '#FFF', rgb: [255, 255, 255, 255] },
        { hex: '#F00', rgb: [255, 0, 0, 255] },
        { hex: '#FF0000FF', rgb: [255, 0, 0, 255] },
        { hex: '#FF000000', rgb: [255, 0, 0, 0] },
        { hex: '#FF0000AA', rgb: [255, 0, 0, 170] },
        { hex: '#F00F', rgb: [255, 0, 0, 255] },
        { hex: '#F000', rgb: [255, 0, 0, 0] },
        { hex: '#F00A', rgb: [255, 0, 0, 170] }
      ];

      for (const { hex, rgb } of testCases) {
        expect(hexToRgb(hex)).toEqual(rgb);
      }
    });
  });
});
