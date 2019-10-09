import errorHandlers from './errors';
import { encodeParameter, getRequest, postRequest } from './utils';

const DEFAULT_SERVER_URL_TEMPLATE = 'https://{user}.carto.com';
const DEFAULT_CLIENT_ID = 'toolkit-maps';
const REQUEST_GET_MAX_URL_LENGTH = 2048;

class Maps {
  private _conf: any;
  private _encodedApiKey: string;
  private _encodedClient: string;

  /**
   * Build an instance to interact with Maps API v1 (aka Windshaft)
   * @param username
   * @param apiKey
   * @param serverURL A url pattern like default ('https://{user}.carto.com')
   *
   */
  constructor(username: string, apiKey: string, serverURL?: string, client?: string) {

    this._conf = {
      username,
      apiKey,
      serverUrlTemplate: serverURL || DEFAULT_SERVER_URL_TEMPLATE
    };

    this._encodedApiKey = encodeParameter('api_key', this._conf.apiKey);
    this._encodedClient = encodeParameter('client', client || DEFAULT_CLIENT_ID);
  }

  public get username(): string {
    return this._conf.username;
  }

  public get apiKey(): string {
    return this._conf.apiKey;
  }

  public get serverURL(): string {
    return this._conf.serverUrlTemplate.replace('{user}', this._conf.username);
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
      throw new Error(`Failed to connect to Maps API with the user ('${this._conf.username}'): ${error}`);
    }

    const layergroup = await response.json();
    if (!response.ok) {
      this.dealWithWindshaftErrors(response, layergroup);
    }

    return layergroup;
  }

  private makeMapsApiRequest(config: string) {
    const parameters = [this._encodedApiKey, this._encodedClient];
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
      errorForCode(this._conf);
      return;
    }
    throw new Error(`${JSON.stringify(layergroup.errors)}`);
  }

  private generateMapsApiUrl(parameters: string[] = []) {
    const base = `${this.serverURL}/api/v1/map`;
    return `${base}?${parameters.join('&')}`;
  }
}

export default Maps;
