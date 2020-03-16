const DEFAULT_USER_NAME = 'username';
const DEFAULT_PUBLIC_API_KEY = 'default_public';
const DEFAULT_SERVER_URL_TEMPLATE = 'https://{user}.carto.com';
const DEFAULT_USER_COMPONENT_IN_URL = '{user}';

/**
 * Build a generic instance of credentials, eg to interact with APIs such as Windshaft or SQL
 * @param username
 * @param apiKey
 * @param serverURL A url pattern with {user}, like default 'https://{user}.carto.com'
 *
 */
export class Credentials {
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

  public static get DEFAULT_SERVER_URL_TEMPLATE() {
    return DEFAULT_SERVER_URL_TEMPLATE;
  }

  public static get DEFAULT_PUBLIC_API_KEY() {
    return DEFAULT_PUBLIC_API_KEY;
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

  public get serverUrlTemplate(): string {
    return this._serverUrlTemplate;
  }

  public set serverUrlTemplate(value: string) {
    this._serverUrlTemplate = value;
  }

  public get serverURL(): string {
    let url = this._serverUrlTemplate.replace(DEFAULT_USER_COMPONENT_IN_URL, this._username);
    if (!url.endsWith('/')) {
      url += '/';
    }
    return  url;
  }
}

export const defaultCredentials = new Credentials(DEFAULT_USER_NAME, DEFAULT_PUBLIC_API_KEY);

export function setDefaultCredentials(credentials: { username: string, apiKey: string, serverUrlTemplate: string }) {
  defaultCredentials.username = credentials.username;
  defaultCredentials.apiKey = credentials.apiKey || DEFAULT_PUBLIC_API_KEY;
  defaultCredentials.serverUrlTemplate = credentials.serverUrlTemplate || DEFAULT_SERVER_URL_TEMPLATE;
}
