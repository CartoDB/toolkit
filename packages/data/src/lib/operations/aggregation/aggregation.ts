import { CartoError } from '@carto/toolkit-core';

export enum AggregationType {
  COUNT = 'count',
  AVG = 'avg',
  MIN = 'min',
  MAX = 'max',
  SUM = 'sum',
  PERCENTILE = 'percentile'
}

export function aggregate(
  values: number[],
  aggregation: AggregationType = '' as AggregationType
) {
  const aggregationData = aggregation.split('_');
  const aggregationName = aggregationData.shift();

  const aggregationFunction =
    aggregationFunctions[aggregationName?.toLowerCase() as AggregationType];

  if (!aggregationFunction) {
    throw new CartoError({
      type: '[DataView]',
      message: `"${aggregation}" aggregation type not implemented`
    });
  }

  return aggregationFunction(values, aggregationData);
}

const aggregationFunctions: Record<AggregationType, Function> = {
  [AggregationType.COUNT](values: number[]) {
    return values.length;
  },

  [AggregationType.AVG](values: number[]) {
    return aggregationFunctions.sum(values) / values.length;
  },

  [AggregationType.MIN](values: number[]) {
    return Math.min(...values);
  },

  [AggregationType.MAX](values: number[]) {
    return Math.max(...values);
  },

  [AggregationType.SUM](values: number[]) {
    return values.reduce((sum, value) => sum + value, 0);
  },

  [AggregationType.PERCENTILE](values: number[], aggregationData: string[]) {
    const percentile = parseInt(aggregationData[0], 10);

    if (!Number.isInteger(percentile) && percentile > 0 && percentile < 100) {
      // eslint-disable-next-line no-console
      console.warn(
        `[ViewportFeatures] ${percentile} percentile value is not correct`
      );
      return 0;
    }

    const orderedValues = values.sort((x, y) => x - y);
    const p = percentile / 100;
    return orderedValues[Math.floor(p * orderedValues.length)];
  }
};
