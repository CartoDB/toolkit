import deepmerge from 'deepmerge';
import { FunctionFilterApplicator } from './FunctionFilterApplicator';
import { ColumnFilters } from './types';

export class FiltersCollection {
  private collection: Map<string, ColumnFilters> = new Map();
  private FilterApplicator: typeof FunctionFilterApplicator;

  constructor(FilterApplicator: typeof FunctionFilterApplicator) {
    this.FilterApplicator = FilterApplicator;
  }

  addFilter(widgetId: string, filterDefinition: ColumnFilters) {
    this.collection.set(widgetId, filterDefinition);
  }

  removeFilter(widgetId: string) {
    this.collection.delete(widgetId);
  }

  getApplicatorInstance() {
    const filters = this._mergeFilters();
    return new this.FilterApplicator(filters);
  }

  private _mergeFilters(): ColumnFilters {
    return deepmerge.all(Array.from(this.collection.values()));
  }

  getUniqueID() {
    // TODO: Improve This
    return JSON.stringify(Array.from(this.collection.values()));
  }
}
