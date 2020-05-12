// eslint-disable-next-line import/no-unresolved
import { sizeBinsStyle, defaultSizeBinsStyleOptions } from '../src/lib/style';
import {
  CartoStylingError,
  stylingErrorTypes
} from '../src/lib/errors/styling-error';

describe('SizeBinsStyle', () => {
  describe('Style creation', () => {
    it('should create a sizeBinsStyle instance properly', () => {
      expect(() =>
        sizeBinsStyle('attributeName', defaultSizeBinsStyleOptions)
      ).not.toThrow();
    });

    it('should fail when creating a sizeBinsStyle instance with invalid parameters', () => {
      expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        () => sizeBinsStyle('attributeName', { breaks: 'invalid' })
      ).toThrow();
    });

    it('should fail when creating a sizeBinsStyle instance with invalid parameters II', () => {
      expect(() => {
        const opts = {
          ...defaultSizeBinsStyleOptions,
          ...{
            breaks: [0, 10],
            bins: 3
          }
        };
        sizeBinsStyle('attributeName', opts);
      }).toThrowError(
        new CartoStylingError(
          'Manual breaks are provided and bins!=breaks.length',
          stylingErrorTypes.PROPERTY_MISMATCH
        )
      );
    });
  });
});
