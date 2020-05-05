/**
 *
 * Base Source definition. We should keep here the code shared between different sources
 */
import { GeometryType, NumericFieldStats, CategoryFieldStats } from '../types';

export interface SourceMetadata {
  geometryType: GeometryType;
  stats: (NumericFieldStats | CategoryFieldStats)[];
}

export interface SourceProps {
  type: 'TileLayer';
}

export abstract class Source {
  // ID of the source. It's mandatory for the source but not for the user.
  public id: string;

  public isInitialized: boolean;

  constructor(id: string) {
    this.id = id;
    this.isInitialized = false;
  }

  abstract async init(fieldsStats?: string[]): Promise<boolean>;

  abstract getProps(): SourceProps;

  abstract getMetadata(): SourceMetadata;
}
