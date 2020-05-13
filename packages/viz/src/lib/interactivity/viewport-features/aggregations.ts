import { castToNumberOrUndefined } from '../../utils/number';

export enum AggregationTypes {
  COUNT = 'count',
  AVG = 'average',
  MIN = 'min',
  MAX = 'max',
  SUM = 'sum',
  PERCENTILE = 'percentile'
}

export function applyAggregations(
  features: Record<string, unknown>[],
  aggregations: Record<string, AggregationTypes[]>
) {
  const propertiesToAggregate = Object.keys(aggregations);

  return propertiesToAggregate.reduce((accumulator, property) => {
    const aggregationsToPerform = aggregations[property as AggregationTypes];
    const propertyValuesInFeature = features
      .map(feature => castToNumberOrUndefined(feature[property] as string))
      .filter(value => Number.isFinite(value as number));

    accumulator[property] = aggregationsToPerform.reduce(
      (propertyAggregations, aggregation) => {
        const aggregationData = aggregation.split('_');
        const aggregationName = aggregationData.shift();

        const aggregationFunction =
          aggregationFunctions[aggregationName?.toLowerCase() as string];

        if (!aggregationFunction) {
          // eslint-disable-next-line no-console
          console.warn(
            `[ViewportFeatures] ${aggregation} aggregation type not implemented`
          );
          return propertyAggregations;
        }

        // eslint-disable-next-line no-param-reassign
        propertyAggregations[aggregation] = aggregationFunction(
          propertyValuesInFeature,
          aggregationData
        );

        return propertyAggregations;
      },
      {} as Record<string, number>
    );

    return accumulator;
  }, {} as Record<string, Record<string, number>>);
}

const aggregationFunctions: Record<string, Function> = {
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
