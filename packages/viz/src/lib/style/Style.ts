import { GeoJsonLayerProps } from '@deck.gl/layers/geojson-layer/geojson-layer';
import { Source } from '../sources/Source';

export type StyleProperties =
  | GeoJsonLayerProps<any>
  | ((source: Source) => GeoJsonLayerProps<any>);

export class Style {
  private _styleProperties: StyleProperties;

  constructor(styleProperties: StyleProperties) {
    this._styleProperties = styleProperties;
  }

  public hasProperties() {
    return Boolean(Object.keys(this._styleProperties).length);
  }

  public getProperties() {
    return this._styleProperties;
  }
}
