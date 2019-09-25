const DEFAULT_SERVER_URL_TEMPLATE = 'https://{user}.carto.com';

class Maps {
  private _username: string;
  private _apiKey: string;
  private _serverURL: string;

  /**
   * Build an instance to interact with Maps API v1 (aka Windshaft)
   * @param username
   * @param apiKey
   * @param serverURL A url pattern like default ('https://{user}.carto.com')
   */
  constructor(username: string, apiKey: string, serverURL: string = DEFAULT_SERVER_URL_TEMPLATE) {
    this._username = username;
    this._apiKey = apiKey;
    this._serverURL = serverURL;
  }

  public get username(): string {
    return this._username;
  }

  public get apiKey(): string {
    return this._apiKey;
  }

  public get serverURL(): string {
    return this._serverURL;
  }

  public instantiateMap(options: any) {
    const mapParameters = this.getMapParameters(options);
    const requestOptions = this.getRequestOptions(mapParameters);

    return this.fetchLayerGroup(requestOptions).then(this.getVectorTileURL);
  }

  private getMapParameters(options: { sql?: string, dataset?: string }) {
    const { sql, dataset } = options;

    if (sql === undefined && dataset === undefined) {
      throw new Error('Please provide a dataset or a SQL query');
    }

    const mapParameters = {
      layers: [{
        type: 'cartodb',
        options: {
            sql: sql || `select * from ${dataset}`
        }
      }],
      version: '1.3.1'
    };

    return mapParameters;
  }

  private getRequestOptions(mapParameters: any) {
    return {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapParameters)
    };
  }

  private fetchLayerGroup(requestOptions: any){
    return fetch(`${this.apiBaseUrl()}?api_key=${this.apiKey}`, requestOptions)
      .then((response) => response.json());
  }

  private getVectorTileURL(layerGroup: any){
    return `${this.apiBaseUrl()}/${layerGroup.layergroupid}/{z}/{x}/{y}.mvt?api_key=${this.apiKey}`;
  }

  private apiBaseUrl() {
    const baseForUser = this._serverURL.replace('{user}', this.username);
    return `${baseForUser}/api/v1/map`;
  }

}

export default Maps;
