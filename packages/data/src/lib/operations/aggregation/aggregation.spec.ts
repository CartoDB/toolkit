import { CartoError } from '@carto/toolkit-core';
import { AggregationType, aggregate } from './aggregation';

describe('Aggregation', () => {
  describe('Errors', () => {
    it('should throw an exception when aggregation type is not implemented', () => {
      expect(() =>
        aggregate(values, 'unknownAggregation' as AggregationType)
      ).toThrow(
        new CartoError({
          type: '[DataView]',
          message: '"unknownAggregation" aggregation type not implemented'
        })
      );
    });
  });

  describe('aggregate', () => {
    it(AggregationType.COUNT, async () => {
      expect(aggregate(values, AggregationType.AVG)).toEqual(30);
    });

    it(AggregationType.AVG, async () => {
      expect(aggregate(values, AggregationType.AVG)).toEqual(30);
    });

    it(AggregationType.MIN, async () => {
      expect(aggregate(values, AggregationType.MIN)).toEqual(10);
    });

    it(AggregationType.MAX, async () => {
      expect(aggregate(values, AggregationType.MAX)).toEqual(50);
    });

    it(AggregationType.SUM, async () => {
      expect(aggregate(values, AggregationType.SUM)).toEqual(150);
    });

    it('percentile_50', async () => {
      expect(aggregate(values, 'percentile_50' as AggregationType)).toEqual(30);
    });

    it('percentile_fake', async () => {
      expect(() =>
        aggregate(values, 'percentile_fake' as AggregationType)
      ).toThrow(
        new CartoError({
          type: '[DataView]',
          message: '"NaN" percentile value is not correct'
        })
      );
    });
  });
});

const values = [10, 20, 30, 40, 50];
