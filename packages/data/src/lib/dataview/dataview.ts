import mitt from 'mitt';
import { CartoError } from '@carto/toolkit-core';
import { Layer, CARTOSource } from '@carto/toolkit-viz';
import {
  applyAggregations,
  AggregationTypes
} from '../aggregations/aggregations';
import { groupValuesByAnotherColumn } from '../aggregations/grouping';

export class DataView {
  private source: CARTOSource | Layer;
  private column: string;
  private emitter = mitt();

  private availableEvents = ['sourceUpdated'];

  constructor(source: CARTOSource | Layer, column: string) {
    validateParameters(source, column);
    this.source = source;
    this.column = column;

    // If layer listen on viewport change
    // this.bindEvents();
  }

  on(type: string, handler: mitt.Handler) {
    if (!this.availableEvents.includes(type)) {
      throw new CartoError({
        type: '[DataView]',
        message: `Unknown event type: ${type}`
      });
    }

    this.emitter.on(type, handler);
  }

  off(type: string, handler: mitt.Handler) {
    if (!this.availableEvents.includes(type)) {
      throw new CartoError({
        type: '[DataView]',
        message: `Unknown event type: ${type}`
      });
    }

    this.emitter.on(type, handler);
  }

  // private bindEvents() {
  //   console.log(this.source instanceof Layer);
  //   // if (this.source instanceof Layer) {
  //   //   this.source.on('viewportChanged', () => {this.onSourceChange()});
  //   // }
  // }

  async aggregate(...operations: AggregationTypes[]) {
    if (!operations || !operations.length) {
      return 0;
    }

    // Get Source Data
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
        type: 'DataView',
        message: "Provided column doesn't exist or has no numeric values"
      });
    }

    return applyAggregations(values, operations);
  }

  async groupBy(keysColumn: string, options: { operation: AggregationTypes }) {
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
    const result: Record<string, number | string>[] = [];

    Object.keys(groupedValues).forEach(group => {
      const groupData = groupedValues[group];
      const filteredValues = groupData.map(number =>
        castToNumberOrUndefined(number)
      ) as number[];

      result.push({
        name: group,
        value: applyAggregations(filteredValues, [operation])[operation]
      });
    });

    return result;
  }

  private getSourceData(columns: string[]) {
    return (this.source as Layer).getViewportFeatures(columns);
  }
}

function validateParameters(source: CARTOSource | Layer, column: string) {
  if (!source) {
    throw new CartoError({
      type: 'DataView',
      message: 'Source was not provided while creating dataview'
    });
  }

  if (!column) {
    throw new CartoError({
      type: 'DataView',
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
