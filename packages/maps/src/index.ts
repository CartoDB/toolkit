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

    this._encodedApiKey = this.encodeParameter('api_key', this._conf.apiKey);
    this._encodedClient = this.encodeParameter('client', client || DEFAULT_CLIENT_ID);
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
   * Instantiate a map based on dataset name or sql query, returning a layergroup
   *
   * Note: Get layergroup.metadata.tilejson.vector.tiles to consume MVT tiles
   * @param options
   */
  public async instantiateSimpleMap(options: { sql?: string, dataset?: string }) {
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
      response = await fetch(this.makeHttpRequest(payload));
    } catch (error) {
      throw new Error(`Failed to connect to Maps API with the user ('${this._conf.username}'): ${error}`);
    }

    const layergroup = await response.json();
    if (!response.ok) {
      this.dealWithWindshaftErrors(response, layergroup);
    }

    return layergroup;
  }

  private makeHttpRequest(payload: any) {
    const parameters = [this._conf.auth, this._encodedClient, this.encodeParameter('config', payload)];
    const url = this.generateUrl(this.generateMapsApiUrl(), parameters);
    if (url.length < REQUEST_GET_MAX_URL_LENGTH) {
      return this.getRequest(url);
    }

    return this.postRequest(payload);
  }

  private dealWithWindshaftErrors(response: any, layergroup: any) {
    if (response.status === 401) {
      throw new Error(
        `Unauthorized access to Maps API: invalid combination of user ('${this._conf._username}') and apiKey ('${this._conf.apiKey}')`
      );
    } else if (response.status === 403) {
      throw new Error(
        `Unauthorized access to dataset: the provided apiKey('${this._conf.apiKey}') doesn't provide access to the requested data`
      );
    }
    throw new Error(`${JSON.stringify(layergroup.errors)}`);
  }

  private getRequest(url: string) {
    return new Request(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    });
  }

  private postRequest(payload: any) {
    const parameters = [this._encodedApiKey, this._encodedClient];

    return new Request(this.generateUrl(this.generateMapsApiUrl(), parameters), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: payload
    });
  }

  private encodeParameter(name: string, value: string) {
    return `${name}=${encodeURIComponent(value)}`;
  }

  private generateUrl(url: string, parameters: string[] = []) {
    return `${url}?${parameters.join('&')}`;
  }

  private generateMapsApiUrl(path?: string) {
    let url = `${this.serverURL}/api/v1/map`;
    if (path) {
      url += path;
    }
    return url;
  }
}

export default Maps;
