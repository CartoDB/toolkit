import { GeoJsonLayerProps } from '@deck.gl/layers/geojson-layer/geojson-layer';

class Style {
  private _styleProperties: GeoJsonLayerProps<any>;

  constructor(styleProperties: GeoJsonLayerProps<any>) {
    this._styleProperties = {...styleProperties};
  }

  public getProperties() {
    return this._styleProperties;
  }
}

export default Style;
