import deepmerge from 'deepmerge';
import { FunctionFilterApplicator } from './FunctionFilterApplicator';

export class FiltersCollection {
  private collection: Map<string, Filter> = new Map();
  private FilterApplicator: typeof FunctionFilterApplicator;

  constructor(FilterApplicator: typeof FunctionFilterApplicator) {
    this.FilterApplicator = FilterApplicator;
  }

  addFilter(widgetId: string, filterDefinition: Filter) {
    this.collection.set(widgetId, filterDefinition);
  }

  removeFilter(widgetId: string) {
    this.collection.delete(widgetId);
  }

  getApplicatorInstance() {
    const filters = this._mergeFilters();
    return new this.FilterApplicator(filters);
  }

  private _mergeFilters() {
    return deepmerge.all(Array.from(this.collection.values())) as Record<
      string,
      Record<string, number | string | []>
    >;
  }

  getUniqueID() {
    // TODO: Improve This
    return JSON.stringify(Array.from(this.collection.values()));
  }
}

interface Filter {
  [column: string]: {
    in: string[];
  };
}
