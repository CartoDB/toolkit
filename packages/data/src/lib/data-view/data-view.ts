import { CartoError, WithEvents } from '@carto/toolkit-core';
import { Layer, CARTOSource } from '@carto/toolkit-viz';
import { groupValuesByAnotherColumn } from '../aggregations/grouping';
import {
  applyAggregations,
  AggregationTypes
} from '../aggregations/aggregations';

export class DataView extends WithEvents {
  private source: CARTOSource | Layer;
  private column: string;

  constructor(source: CARTOSource | Layer, column: string) {
    super();
    validateParameters(source, column);

    this.source = source;
    this.column = column;

    this.bindEvents();
  }

  private bindEvents() {
    this.registerAvailableEvents(['dataUpdate']);

    if (this.source instanceof Layer) {
      this.source.on('viewportLoad', () => {
        this.onDataUpdate();
      });
    }
  }

  private onDataUpdate() {
    this.emitter.emit('dataUpdate');
  }

  async aggregate(...operations: AggregationTypes[]) {
    if (!operations || !operations.length) {
      return {};
    }

    const sourceData = await this.getSourceData([this.column]);
    const values = sourceData
      .map((dataRow: Record<string, unknown>) =>
        castToNumberOrUndefined(dataRow[this.column] as string | number)
      )
      .filter((value: number | undefined) =>
        Number.isFinite(value as number)
      ) as number[];

    if (!values.length) {
      throw new CartoError({
        type: '[DataView]',
        message: "Provided column doesn't exist or has no numeric values"
      });
    }

    return applyAggregations(values, operations);
  }

  async groupBy(
    keysColumn: string,
    options: { operation: AggregationTypes } = {
      operation: AggregationTypes.AVG
    }
  ) {
    const { operation = AggregationTypes.AVG } = options;

    const sourceData = (await this.getSourceData([
      keysColumn,
      this.column
    ])) as Record<string, number | string>[];

    const groupedValues = groupValuesByAnotherColumn(
      sourceData,
      this.column,
      keysColumn
    );

    return Object.keys(groupedValues).map(group => {
      const groupData = groupedValues[group];
      const filteredValues = groupData
        .map(number => castToNumberOrUndefined(number))
        .filter((value: number | undefined) =>
          Number.isFinite(value as number)
        ) as number[];

      if (!filteredValues.length) {
        throw new CartoError({
          type: '[DataView]',
          message: `"${group}" group has no numeric values`
        });
      }

      return {
        name: group,
        value: applyAggregations(filteredValues, [operation])[operation]
      };
    });
  }

  private getSourceData(columns: string[]) {
    return (this.source as Layer).getViewportFeatures(columns);
  }
}

function validateParameters(source: CARTOSource | Layer, column: string) {
  if (!source) {
    throw new CartoError({
      type: '[DataView]',
      message: 'Source was not provided while creating dataview'
    });
  }

  if (!column) {
    throw new CartoError({
      type: '[DataView]',
      message: 'Column name was not provided while creating dataview'
    });
  }
}

function castToNumberOrUndefined(number: string | number) {
  const castedNumber = Number(number);

  if (!Number.isFinite(castedNumber)) {
    return;
  }

  // eslint-disable-next-line consistent-return
  return castedNumber;
}
