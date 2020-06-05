export interface Filter {
  in: string[];
}

export interface ColumnFilters {
  [column: string]: Filter;
}
