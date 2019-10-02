import { CustomStorage } from '@carto/toolkit-custom-storage';
import { SQL } from '@carto/toolkit-sql/dist/types/Client';
const DEFAULT_SERVER = 'https://{user}.carto.com/';
const DEFAULT_NAMESPACE = 'toolkit';

export interface AppOptions {
  namespace: string;
  server: string;
}

export const DEFAULT_OPTIONS = {
  namespace: DEFAULT_NAMESPACE,
  server: DEFAULT_SERVER
};

class App {
  private _server: string = DEFAULT_SERVER;
  private _namespace: string;
  private _apiKey: string | null = null;
  private _username: string | null = null;
  private _customStorage: CustomStorage | null = null;
  private _sql: SQL | null = null;
  private _ready: boolean = false;

  constructor(options: AppOptions = DEFAULT_OPTIONS) {
    const completeOptions = {
      ...DEFAULT_OPTIONS,
      ...options
    };

    const { namespace, server } = completeOptions;

    this._namespace = namespace;
    this._server = server;
  }

  /**
   * Async function that sets the credentials and creates the internal parts.
   *
   * @param apiKey The apiKey for your user
   * @param username The username for your API key
   */
  public async setCredentials(apiKey: string, username: string) {
    this._apiKey = apiKey;
    this._username = username;

    this._customStorage = new CustomStorage(this._namespace, this._username, this._apiKey, this._server);
    this._sql = this._customStorage.getSQLClient();

    await this._customStorage.init();

    this._ready = true;
  }

  public get CustomStorage(): CustomStorage {
    if (this._customStorage === null || !this._ready) {
      throw new Error('No auth has been set yet');
    }

    return this._customStorage;
  }

  public get SQL(): SQL {
    if (this._sql === null || !this._ready) {
      throw new Error('No auth has been setup yet');
    }

    return this._sql;
  }

  public setApiKey(apiKey: string) {
    if (this._sql === null || this._customStorage === null) {
      return;
    }

    this._apiKey = apiKey;
    this._sql.setApiKey(apiKey);
    this._customStorage.setApiKey(apiKey);
  }

}

export default App;
