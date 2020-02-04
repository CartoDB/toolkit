import { DEFAULT_SERVER_URL_TEMPLATE } from '.';

/**
 * Build a generic instance of credentials, eg to interact with APIs such as Windshaft or SQL
 * @param username
 * @param apiKey
 * @param serverURL A url pattern with {user}, like default 'https://{user}.carto.com'
 *
 */
class Credentials {
  private _username: string;
  private _apiKey: string;
  private _serverUrlTemplate: string;

  constructor(username: string, apiKey: string, serverUrlTemplate: string = DEFAULT_SERVER_URL_TEMPLATE) {
    if (!username) {
      throw new Error('Username is required');
    }

    if (!apiKey) {
      throw new Error('Api key is required');
    }

    this._username = username;
    this._apiKey = apiKey;
    this._serverUrlTemplate = serverUrlTemplate;
  }

  public get username(): string {
    return this._username;
  }

  public get apiKey(): string {
    return this._apiKey;
  }

  public set apiKey(value: string) {
    this._apiKey = value;
  }

  public get serverURL(): string {
    return this._serverUrlTemplate.replace('{user}', this._username);
  }
}

export default Credentials;
