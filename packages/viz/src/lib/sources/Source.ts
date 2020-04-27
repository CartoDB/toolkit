/**
 *
 * Base Source definition. We should keep here the code shared between different sources
 */

export interface Blueprint {
  // Geometry Type of the the source: 'Point' | 'MultiPoint' | 'Line' | 'Multiline' | 'Polygon' | 'MultiPolygon'
  geometryType: string;
}

export abstract class Source {
  // ID of the source. It's mandatory for the source but not for the user.
  public id: string;

  constructor(id: string) {
    this.id = id;
  }

  abstract async blueprint(): Promise<Blueprint>;
}
