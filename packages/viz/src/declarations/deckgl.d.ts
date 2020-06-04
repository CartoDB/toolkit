import { TileLayerProps } from '@deck.gl/geo-layers/tile-layer/tile-layer';

export interface ViewportTile {
  x: number;
  y: number;
  z: number;
  content: GeoJSON.Feature[];
  isLoaded: boolean;
  data: Promise<GeoJSON.Feature[]> | GeoJSON.Feature[];
}

export interface DOLayerProps<D> extends TileLayerProps<D> {
  geographiesData: string | string[];
}
