/**
 *
 * Base Source definition. We should keep here the code shared between different sources
 */
import { GeometryType, FieldStats } from '../types';

export interface SourceProps {
  type: 'TileLayer';
}

export abstract class Source {
  // ID of the source. It's mandatory for the source but not for the user.
  public id: string;

  public isInitialize: boolean;

  constructor(id: string) {
    this.id = id;
    this.isInitialize = false;
  }

  abstract async init(field?: string): Promise<boolean>;

  abstract getLayerProps(): SourceProps;

  abstract getGeometryType(): GeometryType;

  /**
   * @abstract
   * Gets metadata for a field of this source. This metadata
   * includes info such as min, max, average and sum values.
   *
   * @param field - the field name that the user is requesting
   * metadata for.
   */
  abstract getFieldStats(field: string): FieldStats;
}
