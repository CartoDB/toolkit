import { Credentials,  DEFAULT_SERVER_URL_TEMPLATE } from '@carto/toolkit-core';
import errorHandlers from './errors';
import { encodeParameter, getRequest, postRequest } from './utils';

const REQUEST_GET_MAX_URL_LENGTH = 2048;

class Maps {
  private _credentials: Credentials;
  private _encodedApiKey: string;

  /**
   * Build an instance to interact with Maps API v1 (aka Windshaft)
   * @param username
   * @param apiKey
   * @param serverURL A url pattern like default ('https://{user}.carto.com')
   *
   */
  constructor(username: string, apiKey: string, serverURL: string = DEFAULT_SERVER_URL_TEMPLATE) {

    this._credentials = new Credentials(username, apiKey, serverURL);
    this._encodedApiKey = encodeParameter('api_key', this._credentials.apiKey);
  }

  /**
   * Instantiate a map based on dataset name or a sql query, returning a layergroup
   *
   * @param options
   */
  public async instantiateMapFrom(options: { sql?: string, dataset?: string }) {
    const { sql, dataset } = options;

    if (sql === undefined && dataset === undefined) {
      throw new Error('Please provide a dataset or a SQL query');
    }

    const mapConfig = {
      layers: [{
        type: 'cartodb',
        options: {
          sql: sql || `select * from ${dataset}`
        }
      }],
      version: '1.3.1'
    };

    return this.instantiateMap(mapConfig);
  }

  private async instantiateMap(mapConfig: any) {
    let response;
    try {
      const payload = JSON.stringify(mapConfig);
      response = await fetch(this.makeMapsApiRequest(payload));
    } catch (error) {
      throw new Error(`Failed to connect to Maps API with the user ('${this._credentials.username}'): ${error}`);
    }

    const layergroup = await response.json();
    if (!response.ok) {
      this.dealWithWindshaftErrors(response, layergroup);
    }

    return layergroup;
  }

  private makeMapsApiRequest(config: string) {
    const parameters = [this._encodedApiKey];
    const url = this.generateMapsApiUrl(parameters);

    const getUrl = `${url}&${encodeParameter('config', config)}`;
    if (getUrl.length < REQUEST_GET_MAX_URL_LENGTH) {
      return getRequest(getUrl);
    }

    return postRequest(url, config);
  }

  private dealWithWindshaftErrors(response: { status: number }, layergroup: any) {
    const errorForCode = errorHandlers[response.status];
    if (errorForCode) {
      errorForCode(this._credentials);
      return;
    }
    throw new Error(`${JSON.stringify(layergroup.errors)}`);
  }

  private generateMapsApiUrl(parameters: string[] = []) {
    const base = `${this._credentials.serverURL}/api/v1/map`;
    return `${base}?${parameters.join('&')}`;
  }
}

export default Maps;
