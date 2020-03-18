// TODO: Add proper module declaration;
import { TileLayer } from '@deck.gl/geo-layers';
import { GeoJsonLayerProps } from '@deck.gl/layers/geojson-layer/geojson-layer';

declare module '@deck.gl/geo-layers' {
  export class MVTLayer<D> extends TileLayer<D> {
    constructor(props: GeoJsonLayerProps<D>);
  }
}
