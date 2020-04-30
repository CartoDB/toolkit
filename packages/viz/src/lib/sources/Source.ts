/**
 *
 * Base Source definition. We should keep here the code shared between different sources
 */

export interface LayerProps {
  // Geometry Type of the the source: 'Point' | 'MultiPoint' | 'Line' | 'Multiline' | 'Polygon' | 'MultiPolygon'
  geometryType: string;
}

export type bins = 'quantiles' | 'stdev' | 'equal';
/**
 * Metadata interface retrieved from the
 * Map API instantiation.
 */
export interface Metadata {
  min: number;
  max: number;
  avg: number;
  sum: number;
}

export abstract class Source {
  // ID of the source. It's mandatory for the source but not for the user.
  public id: string;

  constructor(id: string) {
    this.id = id;
  }

  abstract async getLayerProps(): Promise<LayerProps>;

  abstract async bins(attribute: string, method: bins): Promise<Array<number>>;
  /**
   * @abstract
   * Gets metadata for a field of this source. This metadata
   * includes info such as min, max, average and sum values.
   *
   * @param field - the field name that the user is requesting
   * metadata for.
   */
  abstract async getMetadataForField(field: string): Promise<Metadata>;
}
