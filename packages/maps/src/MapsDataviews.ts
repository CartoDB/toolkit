import { Credentials } from '@carto/toolkit-core';
import { Maps } from './Client';

export class MapsDataviews {
  private _source: string;
  private _mapClient: Maps;

  constructor(source: string, credentials: Credentials) {
    this._source = source;
    this._mapClient = new Maps(credentials);
  }

  public async aggregation(
    params: AggregationParameters
  ): Promise<AggregationResponse> {
    const { column, aggregation, operationColumn, limit } = params;

    const dataviewName = `${this._source}_${Date.now()}`;
    const layergroup = await this._createMapWithAggregationDataviews(
      dataviewName,
      column,
      aggregation,
      operationColumn
    );

    const aggregationResponse = this._mapClient.aggregationDataview(
      layergroup,
      dataviewName,
      limit
    );

    return (aggregationResponse as unknown) as AggregationResponse;
  }

  private _createMapWithAggregationDataviews(
    name: string,
    column: string,
    aggregation: AggregationType,
    operationColumn?: string
  ) {
    const sourceMapConfig = Maps.generateMapConfigFromSource(this._source);
    const sourceId = sourceMapConfig.analyses[0].id;
    const mapConfig = {
      ...sourceMapConfig,
      dataviews: {
        [name]: {
          type: 'aggregation',
          source: { id: sourceId },
          options: {
            column,
            aggregation,
            aggregationColumn: operationColumn
          }
        }
      }
    };

    const response = this._mapClient.instantiateMap(mapConfig);
    return response;
  }
}

export interface AggregationResponse {
  count: number;
  max: number;
  min: number;
  nulls: number;
  nans: number;
  infinities: number;
  aggregation: AggregationType;
  categoriesCount: number;
  categories: AggregationCategory[];
  errors_with_context?: { type: string; message: string }[];
  errors?: string[];
}

export interface AggregationCategory {
  agg: boolean;
  category: string;
  value: number;
}

export interface AggregationParameters {
  /**
   * column name to aggregate by
   */
  column: string;

  /**
   * operation to perform
   */
  aggregation: AggregationType;

  /**
   * The num of categories
   */
  limit?: number;

  /**
   * Column value to aggregate.
   * This param is required when
   * `aggregation` is different than "count"
   */
  operationColumn?: string;
}

export enum AggregationType {
  COUNT = 'count',
  AVG = 'avg',
  MIN = 'min',
  MAX = 'max',
  SUM = 'sum',
  PERCENTILE = 'percentile'
}
