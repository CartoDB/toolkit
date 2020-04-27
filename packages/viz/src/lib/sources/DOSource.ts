import { Credentials, defaultCredentials } from '@carto/toolkit-core';

import { MVTLayer } from '@deck.gl/geo-layers';
import { Source } from './Source';
import {load} from '@loaders.gl/core';
import {MVTLoader} from '@loaders.gl/mvt';

async function loadData(url: string, options: any) {
  
  const data = await fetch(url, options);

  if (data.status === 200 || data.status === 206) {
    return await data.json();
  } else if (data.status === 204) {
    return null;
  } 
  
  console.error(`Error fetching data tile. Status code: ${data.status}`);
  return null;
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

    if (data) {
      // Do the join
      for (const geo of geographies){
        geo.properties = Object.assign(geo.properties, data.data[geo.properties.geoid]);
        console.log(geo.properties);
      }
    }
    
    return geographies;
  }

}

export class DOSource extends Source {

  // CARTO's credentials of the user
  private _credentials: Credentials;

  // DO variable id
  private _variable: string;

  // BASE URL
  private _baseURL: string;

  constructor(variable: string, credentials?: Credentials) {
        
    // set layer id
    const id = `DOSource-${variable}`;

    // call to super class
    super(id);

    this._credentials = credentials ? credentials : defaultCredentials;

    this._variable = variable;

    this._baseURL = `${this._credentials.serverURL}api/v4/data/observatory`;

  }

  private async _getVariable(): Promise<any> {
    const url = `${this._baseURL}/metadata/variables/${this._variable}`;
    const r = await fetch(url);
    if (r.status === 200) {
      return await r.json();
    } else if (r.status == 404) {
      return new Error('Variable not found');
    }
    return new Error('Unexpected error fetching the variable');
  }

  private async _getDataset(dataset_id: string): Promise<any> {
    const url = `${this._baseURL}/metadata/datasets/${dataset_id}`;
    const r = await fetch(url);
    if (r.status === 200) {
      return await r.json();
    } else if (r.status == 404) {
      return new Error('Dataset not found');
    }
    return new Error('Unexpected error fetching the variable');
  
  }

  public async blueprint(): Promise<any> {

    const vizURL = `${this._baseURL}/visualization`;
    const apiKey = this._credentials.apiKey;

    // Get geography from metadata 
    const variable = await this._getVariable();
    const dataset = await this._getDataset(variable.dataset_id);
    const geography = dataset.geography_id; 

    const geographiesURL = `${vizURL}/geographies/${geography}/{z}/{x}/{y}.mvt?api_key=${apiKey}`;
    const dataURL = `${vizURL}/variables/{z}/{x}/{y}.json?variable=${this._variable}&api_key=${apiKey}`;
    const geometryType = 'MultiPolygon';
    
    return Promise.resolve({ geographiesURL, dataURL, geometryType });
  }


}
