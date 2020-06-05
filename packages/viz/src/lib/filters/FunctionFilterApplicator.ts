import { GeoJsonProperties } from 'geojson';
import { CartoError } from '@carto/toolkit-core';
import { ColumnFilters } from './types';

export enum FilterType {
  IN = 'IN'
}

export class FunctionFilterApplicator {
  private filters: ColumnFilters;

  constructor(filters: ColumnFilters) {
    // TODO: Deep clone?
    this.filters = filters;
  }

  getApplicator() {
    return this.applicator.bind(this);
  }

  applicator(feature: GeoJsonProperties) {
    const columns = Object.keys(this.filters);

    if (!columns) {
      return 1;
    }

    const featurePassesFilter = columns.every(column => {
      const columnFilters = this.filters[column];
      const columnFilterTypes = Object.keys(columnFilters);

      if (!feature || !feature[column]) {
        return false;
      }

      return columnFilterTypes.every(filter => {
        const filterFunction =
          filterFunctions[filter.toUpperCase() as FilterType];

        if (!filterFunction) {
          throw new CartoError({
            type: 'Layer',
            message: `"${filterFunction}" not implemented in FunctionFilterApplicator`
          });
        }

        return filterFunction(columnFilters[filter], feature[column] || '');
      });
    });

    return Number(featurePassesFilter);
  }
}

const filterFunctions: Record<FilterType, Function> = {
  [FilterType.IN](filterValues: string[], featureValue: string) {
    return filterValues.includes(featureValue);
  }
};
