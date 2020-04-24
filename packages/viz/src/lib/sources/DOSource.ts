import { Credentials, defaultCredentials } from '@carto/toolkit-core';

import { MVTLayer } from '@deck.gl/geo-layers';
import { Source, blueprint } from './Source';
import {fetchFile, load} from '@loaders.gl/core';
import {MVTLoader} from '@loaders.gl/mvt';
// import {getURLFromTemplate} from '../tile-layer/utils';


async function loadData(url: string, options: any) {
  const data = await fetchFile(url, options);
  return await data.json();
}

export function getURLFromTemplate(template:any, properties:any) {
  if (!template || !template.length) {
    return null;
  }
  if (Array.isArray(template)) {
    const index = Math.abs(properties.x + properties.y) % template.length;
    template = template[index];
  }
  return template.replace(/\{ *([\w_-]+) *\}/g, (_: any, property: any) => properties[property]);
}
  
export class DataObservatoryLayer extends MVTLayer<any> {
  //public layerName: string = 'DataObservatoryLayer'
    
  async getTileData(tile: any) {
    debugger;
    console.log('here');
    const geographiesURL = getURLFromTemplate(this.props.geographiesURL, tile);
    if (!geographiesURL) {
      return Promise.reject('Invalid geographies URL');
    }
    const dataURL = getURLFromTemplate(this.props.dataURL, tile);
    if (!dataURL) {
      return Promise.reject('Invalid data URL');
    }

       // Run two request in parallel
    const geographiesJob = load(geographiesURL, MVTLoader, this.getLoadOptions());
    const dataJob = loadData(dataURL, this.getLoadOptions());

    // Wait for the result
    const geographies = await geographiesJob;
    const data = await dataJob;

    // Do the join
    for (const geo of geographies){
      geo.properties = Object.assign(geo.properties, data.data[geo.properties.geoid]);
    }
    
    return geographies;
  }

}

const DO_PATH = 'api/v4/data/observatory';
const VIZ_ENDPOINT_PATH =`${DO_PATH}/visualization`;


export class DOSource extends Source {

  // CARTO's credentials of the user
  private _credentials: Credentials;

  // DO variable id
  private _variable: string;

  constructor(variable: string, credentials?: Credentials) {
        
    // set layer id
    const id = `DOSource-${variable}`;

    // call to super class
    super(id);

    this._credentials = credentials ? credentials : defaultCredentials;

    this._variable = variable;

  }

  public blueprint(): Promise<any> {

    const basePath = `${this._credentials.serverURL}/${VIZ_ENDPOINT_PATH}`
    const apiKey = this._credentials.apiKey;
    const geography = 'usct_blockgroup_f45b6b49'; 
    const geographiesURL = `${basePath}/geographies/${geography}/{z}/{x}/{y}.mvt?api_key=${apiKey}`;
    const dataURL = `${basePath}/variables/{z}/{x}/{y}.json?variable=${this._variable}&api_key=${apiKey}`;
    const geometryType = 'MultiPolygon';
    
    return Promise.resolve({ geographiesURL, dataURL, geometryType });
  }


}

