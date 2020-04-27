// // TODO: Add proper module declaration and remove any
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TileLayer } from '@deck.gl/geo-layers';
import { GeoJsonLayerProps } from '@deck.gl/layers/geojson-layer/geojson-layer';
import Tile from '@deck.gl/geo-layers/tile-layer/utils/tile';

declare module '@deck.gl/geo-layers' {
  export class MVTLayer<D> extends TileLayer<D> {
    constructor(props: GeoJsonLayerProps<D>);
    getTileData(tile: Tile): Promise<any>;
    getLoadOptions(): any;
  }
}
