import { GeoJsonLayerProps } from '@deck.gl/layers/geojson-layer/geojson-layer';
import { CartoStylingError, stylingErrorTypes } from '../errors/styling-error';
import { StyledLayer } from './layer-style';

export type StyleProperties =
  | GeoJsonLayerProps<any>
  | ((layerStyle: StyledLayer) => GeoJsonLayerProps<any>);

export class Style {
  private _styleProperties: StyleProperties;
  private _field?: string;

  constructor(styleProperties: StyleProperties, field?: string) {
    this._styleProperties = styleProperties;
    this._field = field;
  }

  public getLayerProps(layerStyle?: StyledLayer) {
    if (typeof this._styleProperties === 'function') {
      if (layerStyle === undefined) {
        throw new CartoStylingError(
          'No layer instance when calling styles function',
          stylingErrorTypes.SOURCE_INSTANCE_MISSING
        );
      }

      return this._styleProperties(layerStyle);
    }

    return this._styleProperties;
  }

  public get field() {
    return this._field;
  }
}
