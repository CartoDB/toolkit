/**
 *
 * Base Source definition. We should keep here the code shared between different sources
 */

export interface LayerProps {
  // Geometry Type of the the source: 'Point' | 'MultiPoint' | 'Line' | 'Multiline' | 'Polygon' | 'MultiPolygon'
  geometryType: string;
}

export type bins = 'quantiles' | 'stdev' | 'equal';

export abstract class Source {
  // ID of the source. It's mandatory for the source but not for the user.
  public id: string;

  constructor(id: string) {
    this.id = id;
  }

  abstract async getLayerProps(): Promise<LayerProps>;

  abstract async bins(attribute: string, method: bins): Promise<Array<number>>;
}
