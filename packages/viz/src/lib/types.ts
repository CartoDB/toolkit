export enum GeometryType {
  Point = 'Point',
  //   MultiPoint = 'MultiPoint',
  Line = 'Line',
  //   MultiLine = 'MultiLine',
  Polygon = 'Polygon'
  //   MultiPolygon = 'MultiPolygon'
}

export interface NumericFieldStats {
  name: string;
  min: number;
  max: number;
  avg: number;
  sum: number;
  sample?: number[];
  stdev?: number;
  range?: number;
}

export interface Category {
  category: string;
  frequency: number;
}

export interface CategoryFieldStats {
  name: string;
  categories: Category[];
}
