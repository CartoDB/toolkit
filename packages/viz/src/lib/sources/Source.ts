/**
 *
 * Base Source definition. We should keep here the code shared between different sources
 */

export type GeometryType = 'Point' | 'Line' | 'Polygon';

export interface NumericFieldStats extends Stats {
  name: string;
}

export interface Category {
  category: string;
  frequency: number;
}

export interface CategoryFieldStats {
  name: string;
  categories: Category[];
}

export interface SourceMetadata {
  geometryType: GeometryType;
  stats: (NumericFieldStats | CategoryFieldStats)[];
}

export interface SourceProps {
  type: 'TileLayer' | 'GeoJsonLayer';
}

export interface StatFields {
  sample: Set<string>;
  aggregation: Set<string>;
}

export interface Stats {
  min: number;
  max: number;
  avg?: number;
  sum?: number;
  sample?: number[];
  stdev?: number;
  range?: number;
}

export abstract class Source {
  // ID of the source. It's mandatory for the source but not for the user.
  public id: string;

  public isInitialized: boolean;

  constructor(id: string) {
    this.id = id;
    this.isInitialized = false;
  }

  abstract async init(fields?: StatFields): Promise<boolean>;

  abstract getProps(): SourceProps;

  abstract getMetadata(): SourceMetadata;
}
