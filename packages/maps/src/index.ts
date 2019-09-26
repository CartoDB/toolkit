class Maps {
  private _username: string;
  private _apiKey: string;

  constructor(username: string, apiKey: string) {
    this._username = username;
    this._apiKey = apiKey;
  }

  public get username(): string {
    return this._username;
  }

  public set username(value: string) {
    this._username = value;
  }

  public get apiKey(): string {
    return this._apiKey;
  }

  public set apiKey(value: string) {
    this._apiKey = value;
  }

  public instantiateMap(options: { sql?: string, dataset?: string }) {
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

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapParameters)
    };

    return fetch(`https://${this.username}.carto.com/api/v1/map?api_key=${this.apiKey}`, requestOptions)
      .then((response) => response.json())
      .then((data) => `https://${this.username}.carto.com/api/v1/map/${data.layergroupid}/{z}/{x}/{y}.mvt?api_key=${this.apiKey}`);
  }
}

export default Maps;
