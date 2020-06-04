import { CartoError } from '@carto/toolkit-core';
import { Layer, CARTOSource } from '@carto/toolkit-viz';
import { DataView } from '../dataview';
import {
  AggregationType,
  aggregate
} from '../../operations/aggregation/aggregation';
import { groupValuesByAnotherColumn } from '../../operations/grouping';

export class CategoryDataView extends DataView {
  private operation: AggregationType;
  private operationColumn: string;
  private limit: number | undefined;

  constructor(
    dataSource: CARTOSource | Layer,
    column: string,
    options: CategoryDataViewOptions
  ) {
    const { operation, operationColumn, limit } = options || {};

    validateParameters(operation, operationColumn);
    super(dataSource, column);

    this.operation = operation;
    this.operationColumn = operationColumn;
    this.limit = limit;
  }

  async getData() {
    const { categories, nullCount } = await this.groupBy();
    const categoryValues = categories.map(category => category.value);

    return {
      categories: Number.isInteger(this.limit as number)
        ? categories.splice(0, this.limit)
        : categories,
      count: categories.length,
      operation: this.operation,
      max: aggregate(categoryValues, AggregationType.MAX),
      min: aggregate(categoryValues, AggregationType.MIN),
      nullCount
    };
  }

  private async groupBy() {
    const sourceData = await this.getSourceData([
      this.column,
      this.operationColumn
    ]);
    const { groups, nullCount } = groupValuesByAnotherColumn(
      sourceData,
      this.operationColumn,
      this.column
    );

    const categories = Object.keys(groups).map(group =>
      this.createCategory(group, groups[group] as number[])
    );

    return { nullCount, categories };
  }

  private createCategory(name: string, data: number[]) {
    const numberFilter = function numberFilter(value: number | undefined) {
      return Number.isFinite(value as number);
    };

    const filteredValues = data
      .map(number => castToNumberOrUndefined(number))
      .filter(numberFilter) as number[];

    return {
      name,
      value: aggregate(filteredValues, this.operation)
    };
  }
}

function validateParameters(
  operation: AggregationType,
  operationColumn: string
) {
  if (!operation) {
    throw new CartoError({
      type: '[DataView]',
      message:
        'Operation property not provided while creating dataview. Please check documentation.'
    });
  }

  if (!operationColumn) {
    throw new CartoError({
      type: '[DataView]',
      message:
        'Operation column property not provided while creating dataview. Please check documentation.'
    });
  }
}

export interface CategoryDataViewOptions {
  limit?: number;
  operation: AggregationType;
  operationColumn: string;
}

function castToNumberOrUndefined(number: string | number) {
  const castedNumber = Number(number);

  if (!Number.isFinite(castedNumber)) {
    return;
  }

  // eslint-disable-next-line consistent-return
  return castedNumber;
}
