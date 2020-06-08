import { Layer, CARTOSource } from '@carto/toolkit-viz';
import { AggregationType } from '../../operations/aggregation/aggregation';
import { SourceDataView } from '../SourceDataView';
import { CategoryDataViewOptions } from './category';
import { CartoDataViewError, dataViewErrorTypes } from '../DataViewError';

const OPTION_CHANGED_DELAY = 250;

export class CategorySourceDataView extends SourceDataView {
  private _operation: AggregationType;
  private _operationColumn: string;
  private _limit: number | undefined;

  /**
   * optionChanged timeout to prevent multiple
   * calls when user sets several options in a row
   */
  private optionChangedTimeoutId?: number;

  constructor(
    source: CARTOSource | Layer,
    column: string,
    options: CategoryDataViewOptions
  ) {
    super(source, column);
    this.registerAvailableEvents(['dataChanged', 'optionChanged', 'error']);

    const { operation, operationColumn, limit } = options || {};

    validateParameters(operation, operationColumn);

    this._operation = operation;
    this._operationColumn = operationColumn;
    this._limit = limit;

    this.on('optionChanged', () => {
      // timeout prevents multiple calls to getData
      // when user sets several options in a row
      if (this.optionChangedTimeoutId) {
        window.clearTimeout(this.optionChangedTimeoutId);
      }

      this.optionChangedTimeoutId = window.setTimeout(async () => {
        const newData = await this.getData();
        this.emit('dataChanged', [newData]);
      }, OPTION_CHANGED_DELAY);
    });
  }

  public set operation(operation: AggregationType) {
    this._operation = operation;
    this.emit('optionChanged');
  }

  public set operationColumn(operationColumn: string) {
    this._operationColumn = operationColumn;
    this.emit('optionChanged');
  }

  public set limit(limit: number) {
    this._limit = limit;
    this.emit('optionChanged');
  }

  public async getData() {
    const aggregationResponse = await this.dataviewsApi.aggregation({
      column: this.column,
      aggregation: this._operation,
      operationColumn: this._operationColumn,
      limit: this._limit
    });

    if (
      aggregationResponse.errors_with_context &&
      aggregationResponse.errors_with_context.length > 0
    ) {
      this.emit('error', aggregationResponse.errors_with_context);
      const { message, type } = aggregationResponse.errors_with_context[0];
      throw new CartoDataViewError(
        `${type}: ${message}`,
        dataViewErrorTypes.MAPS_API
      );
    }

    const {
      aggregation,
      categories,
      count,
      max,
      min,
      nulls
    } = aggregationResponse;

    const adaptedCategories = categories.map(({ category, value }) => {
      return {
        name: category,
        value
      };
    });

    return {
      categories: adaptedCategories,
      count,
      max,
      min,
      nullCount: nulls,
      operation: aggregation
    };
  }
}

function validateParameters(
  operation: AggregationType,
  operationColumn: string
) {
  if (!operation) {
    throw new CartoDataViewError(
      'Operation property not provided while creating dataview. Please check documentation.',
      dataViewErrorTypes.PROPERTY_MISSING
    );
  }

  if (!operationColumn) {
    throw new CartoDataViewError(
      'Operation column property not provided while creating dataview. Please check documentation.',
      dataViewErrorTypes.PROPERTY_MISSING
    );
  }
}
