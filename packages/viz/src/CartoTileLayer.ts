import { Credentials } from '@carto/toolkit-core';
import { Maps } from '@carto/toolkit-maps';
// import Style from './Style';

declare global {
  interface Window {
      deck: any;
  }
}

class CartoTileLayer {
  private _source: string;

  private _deck: any;
  private _mapOptions: object;
  private _credentials: Credentials;
  // private _style: object;

  private _mapsClient: Maps;

  constructor(
    source: string,
    options: {
      deckInstance?: any,
      mapOptions?: object,
      credentials?: Credentials
    } = {}) {

    this._source = source;

    const { deckInstance, mapOptions, credentials } = options;

    this._deck = deckInstance || window.deck;
    this._mapOptions = Object.assign({}, mapOptions, {
      vector_extent: 2048,
      vector_simplify_extent: 2048
    });
    this._credentials = credentials || Credentials.default;

    // this._style = style;
    this._mapsClient = new Maps(this._credentials);
  }

  public async buildDeckglLayer(props: { layerType?: any} = {}) {
    // const layerType = props.layerType;
    const styleProps = Object.assign({}, props, { layerType: undefined });

    // const deckLayer = layerType || this._deck.GeoJsonLayer;

    const urlTemplates = await this.instantiateMap().then((data: any) => {
      const urlData = data.metadata.url.vector;

      return urlData.subdomains.map(
        (subdomain: any) => urlData.urlTemplate.replace('{s}', subdomain)
      );
    });

    return new this._deck.MVTTileLayer(
      Object.assign({}, styleProps, {
        getLineColor: [192, 0, 0],
        getFillColor: [200, 120, 80],
        lineWidthMinPixels: 1,
        pointRadiusMinPixels: 5,
        urlTemplates,
        uniquePropertyName: 'cartodb_id',
        // renderSubLayers: (props) => {
        //   return new deckLayer({
        //     ...props
        //   });
        // }
      })
    );
  }

  private async instantiateMap() {
    let options;
    if (this._source.split(' ').length === 1) {
      options = Object.assign({}, this._mapOptions, { dataset: this._source });
    } else {
      options = Object.assign({}, this._mapOptions, { sql: this._source });
    }

    return await this._mapsClient.instantiateMapFrom(options);
  }
}


export default CartoTileLayer;
