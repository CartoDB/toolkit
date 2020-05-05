export type GeometryType = 'Point' | 'Line' | 'Polygon';

export interface NumericFieldStats {
  name?: string;
  min: number;
  max: number;
  avg?: number;
  sum?: number;
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
