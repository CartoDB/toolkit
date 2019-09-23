import { Credentials } from '@carto/toolkit-auth';

class Maps {
  private _credentials: Credentials;

  constructor(username: string, apiKey: string) {
    this._credentials = new Credentials(username, apiKey);
  }

  public get credentials(): Credentials {
    return this._credentials;
  }

  public set credentials(value: Credentials) {
    this._credentials = value;
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

    const { username, apiKey } = this._credentials;

    return fetch(`https://${username}.carto.com/api/v1/map?api_key=${apiKey}`, requestOptions)
      .then((response) => response.json())
      .then((data) => `https://${username}.carto.com/api/v1/map/${data.layergroupid}/{z}/{x}/{y}.mvt?api_key=${apiKey}`);
  }
}

export default Maps;
