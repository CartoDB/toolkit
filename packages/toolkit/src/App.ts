import { CustomStorage, PublicStorageReader } from '@carto/toolkit-custom-storage';
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

export interface AuthRequiredProps {
  SQL: SQL;
  CustomStorage: CustomStorage;
}

class App {
  protected _customStorage: CustomStorage | null = null;
  protected _sql: SQL | null = null;
  private _server: string = DEFAULT_SERVER;
  private _namespace: string;
  private _apiKey: string | null = null;
  private _username: string | null = null;
  private _publicStorageReader: PublicStorageReader;
  private _initPromise: Promise<AuthRequiredProps> | null = null;

  constructor(options: AppOptions = DEFAULT_OPTIONS) {
    const completeOptions = {
      ...DEFAULT_OPTIONS,
      ...options
    };

    const { namespace, server } = completeOptions;

    this._namespace = namespace;
    this._server = server;

    this._publicStorageReader = new PublicStorageReader(namespace, server);
  }

  /**
   * Async function that sets the credentials and creates the internal parts.
   *
   * @param apiKey The apiKey for your user
   * @param username The username for your API key
   */
  public async setCredentials(apiKey: string, username: string) {
    if (this._customStorage || this._sql) {
      return;
    }

    this._apiKey = apiKey;
    this._username = username;

    this._customStorage = new CustomStorage(this._namespace, this._username, this._apiKey, this._server);
    this._sql = this._customStorage.getSQLClient();

    this._initPromise = this._customStorage.init().then(() => {
      if (this._sql === null || this._customStorage === null) {
        throw new Error('Something went wrong setting the credentials');
      }

      return {
        SQL: this._sql,
        CustomStorage: this._customStorage
      };
    });

    return this._initPromise;
  }

  public setApiKey(apiKey: string) {
    if (this._sql === null || this._customStorage === null) {
      return;
    }

    this._apiKey = apiKey;
    this._sql.setApiKey(apiKey);
    this._customStorage.setApiKey(apiKey);
  }

  public get CustomStorage(): Promise<CustomStorage> {
    if (this._initPromise === null) {
      throw new Error('No auth has been set yet');
    }

    return this._initPromise.then(({ CustomStorage: cs }) => cs);
  }

  public get SQL(): Promise<SQL> {
    if (this._initPromise === null) {
      throw new Error('No auth has been set yet');
    }

    return this._initPromise.then(({ SQL: sql }) => sql);
  }

  public get PublicStorageReader(): PublicStorageReader {
    return this._publicStorageReader;
  }

  public get username(): string {
    return this._username;
  }

  public get server(): string {
    return this._server;
  }

  public get namespace(): string {
    return this._namespace;
  }

  public get apiKey(): string {
    return this._apiKey;
  }

}

export default App;
