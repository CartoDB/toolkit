export enum AggregationTypes {
  COUNT = 'count',
  AVG = 'avg',
  MIN = 'min',
  MAX = 'max',
  SUM = 'sum',
  PERCENTILE = 'percentile'
}

export function applyAggregations(
  values: number[],
  aggregations: AggregationTypes[]
) {
  const result: Record<string, number> = {};

  aggregations.forEach((aggregation: AggregationTypes) => {
    const aggregationData = aggregation.split('_');
    const aggregationName = aggregationData.shift();

    const aggregationFunction =
      aggregationFunctions[aggregationName?.toLowerCase() as AggregationTypes];

    if (!aggregationFunction) {
      // eslint-disable-next-line no-console
      console.warn(
        `[ViewportFeatures] ${aggregation} aggregation type not implemented`
      );
    }

    result[aggregation] = aggregationFunction(values, aggregationData);
  });

  return result;
}

const aggregationFunctions: Record<AggregationTypes, Function> = {
  [AggregationTypes.COUNT](values: number[]) {
    return values.length;
  },

  [AggregationTypes.AVG](values: number[]) {
    return aggregationFunctions.sum(values) / values.length;
  },

  [AggregationTypes.MIN](values: number[]) {
    return Math.min(...values);
  },

  [AggregationTypes.MAX](values: number[]) {
    return Math.max(...values);
  },

  [AggregationTypes.SUM](values: number[]) {
    return values.reduce((sum, value) => sum + value, 0);
  },

  [AggregationTypes.PERCENTILE](values: number[], aggregationData: string[]) {
    const percentile = parseInt(aggregationData[0], 10);

    if (!Number.isInteger(percentile)) {
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
