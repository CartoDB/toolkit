import { GeoJsonLayerProps } from '@deck.gl/layers/geojson-layer/geojson-layer';

export class Style {
  private _styleProperties: GeoJsonLayerProps<any>;

  constructor(styleProperties: GeoJsonLayerProps<any>) {
    this._styleProperties = { ...styleProperties };
  }

  public hasProperties() {
    return Boolean(Object.keys(this._styleProperties).length);
  }

  public getProperties() {
    return this._styleProperties;
  }
}
