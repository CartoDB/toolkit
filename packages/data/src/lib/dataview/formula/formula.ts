import { CartoError } from '@carto/toolkit-core';
import { Layer, CARTOSource } from '@carto/toolkit-viz';
import { DataView } from '../dataview';
import {
  AggregationType,
  aggregate
} from '../../operations/aggregation/aggregation';

export class FormulaDataView extends DataView {
  private operation: AggregationType;

  constructor(
    dataSource: CARTOSource | Layer,
    column: string,
    options: FormulaDataViewOptions
  ) {
    const { operation } = options || {};
    validateParameters(operation, column);

    super(dataSource, column);

    this.operation = operation;
  }

  async getData() {
    const sourceData = await this.getSourceData([this.column]);

    const filteredValues = sourceData.reduce(
      (values: number[], feature: any) => {
        const value = feature[this.column];

        if (Number.isFinite(value)) {
          values.push(value);
        }

        return values;
      },
      []
    );

    const nulls = sourceData.length - filteredValues.length;

    return {
      result: aggregate(filteredValues, this.operation),
      operation: this.operation,
      nullCount: nulls
    };
  }
}

function validateParameters(operation: AggregationType, column: string) {
  if (!operation) {
    throw new CartoError({
      type: '[DataView]',
      message:
        'Operation property not provided while creating dataview. Please check documentation.'
    });
  }

  if (!column) {
    throw new CartoError({
      type: '[DataView]',
      message:
        'Column property not provided while creating dataview. Please check documentation.'
    });
  }
}

interface FormulaDataViewOptions {
  operation: AggregationType;
}
