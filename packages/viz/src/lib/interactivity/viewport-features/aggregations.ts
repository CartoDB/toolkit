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
    // TODO: Check that all values are numbers
    const propertyValuesInFeature = features.map(feature => feature[property]);
    const aggregationsToPerform = aggregations[property as AggregationTypes];

    accumulator[property] = aggregationsToPerform.reduce(
      (propertyAggregations, aggregation) => {
        const aggregationFunction =
          aggregationFunctions[aggregation.toLowerCase()];

        if (!aggregationFunction) {
          // eslint-disable-next-line no-console
          console.warn(
            `[ViewportFeatures] ${aggregation} aggregation type not implemented`
          );
          return propertyAggregations;
        }

        // eslint-disable-next-line no-param-reassign
        propertyAggregations[aggregation] = aggregationFunction(
          propertyValuesInFeature
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [AggregationTypes.PERCENTILE](_values: number[]) {
    throw new Error('Not implemented yet');
  }
};
