/**
 * 
 * Base Source definition. We should keep here the code shared between different sources 
 */

import { Credentials } from '@carto/toolkit-core';
import { MapOptions } from '@carto/toolkit-maps';

export interface sourceOptions {
  credentials?: Credentials;
  mapOptions?: MapOptions;
}

/* Interface definition of source blue print */
export interface blueprint {
  // TileURL of the source. it should be in the format of https://server/{z}/{x}/{y}..
  tileURL: string | Array<string>,
  // Geometry Type of the the source. TODO: It needs review since a tileset could have different kind of geom types
  geometryType: 'Point' | 'MultiPoint' | 'Line' | 'Multiline' | 'Polygon' | 'MultiPolygon'
}


export abstract class Source {
  public id: string ;  

  constructor(id: string) {
      this.id = id;
  }

  abstract async blueprint() : Promise<blueprint>;
}