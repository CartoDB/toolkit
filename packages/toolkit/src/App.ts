import { Credentials } from '@carto/toolkit-core';
import { CustomStorage, PublicStorageReader } from '@carto/toolkit-custom-storage';
import { Constants, SQL } from '@carto/toolkit-sql';

const DEFAULT_NAMESPACE = 'toolkit';

export interface AppOptions {
  namespace: string;
  serverUrlTemplate: string;
  maxApiRequestsRetries: number;
}

export const DEFAULT_OPTIONS = {
  namespace: DEFAULT_NAMESPACE,
  serverUrlTemplate: Credentials.DEFAULT_SERVER_URL_TEMPLATE,
  maxApiRequestsRetries: Constants.DEFAULT_MAX_API_REQUESTS_RETRIES
};

export interface AuthRequiredProps {
  SQL: SQL;
  CustomStorage: CustomStorage;
}

class App {
  protected _customStorage: CustomStorage | null = null;
  protected _sql: SQL | null = null;
  private _serverUrlTemplate: string = Credentials.DEFAULT_SERVER_URL_TEMPLATE;
  private _namespace: string;
  private _apiKey: string | null = null;
  private _username: string | null = null;
  private _maxApiRequestsRetries: number = Constants.DEFAULT_MAX_API_REQUESTS_RETRIES;
  private _publicStorageReader: PublicStorageReader;
  private _initPromise: Promise<AuthRequiredProps> | null = null;

  constructor(options: AppOptions = DEFAULT_OPTIONS) {
    const completeOptions = {
      ...DEFAULT_OPTIONS,
      ...options
    };

    const { namespace, serverUrlTemplate, maxApiRequestsRetries } = completeOptions;

    this._namespace = namespace;
    this._serverUrlTemplate = serverUrlTemplate;
    this._maxApiRequestsRetries = maxApiRequestsRetries;

    this._publicStorageReader = new PublicStorageReader(namespace, serverUrlTemplate);
  }

  /**
   * Async function that sets the credentials and creates the internal parts.
   *
   * @param apiKey The apiKey for your user
   * @param username The username for your API key
   */
  public async setCredentials(apiKey: string, username: string) {
    if (this._customStorage && this._sql) {
      return {
        SQL: this._sql,
        CustomStorage: this._customStorage
      };
    }

    this._apiKey = apiKey;
    this._username = username;

    const credentials = new Credentials(this._username, this._apiKey, this._serverUrlTemplate);
    this._customStorage = new CustomStorage(
      this._namespace,
      credentials,
      { maxApiRequestsRetries: this._maxApiRequestsRetries }
    );
    this._sql = this._customStorage.getSQLClient();

    this._initPromise = this._customStorage.init()
      .then(() => {
        if (this._sql === null || this._customStorage === null) {
          throw new Error('Something went wrong setting the credentials');
        }

        return {
          SQL: this._sql,
          CustomStorage: this._customStorage
        };
      })
      .catch(() => {
        throw new Error('Something went wrong initializing custom storage');
      });

    return this._initPromise;
  }

  public getCustomStorage(): Promise<CustomStorage> {
    if (this._initPromise === null) {
      throw new Error('No auth has been set yet');
    }

    return this._initPromise.then(({ CustomStorage: cs }) => cs);
  }

  public getSQL(): Promise<SQL> {
    if (this._initPromise === null) {
      throw new Error('No auth has been set yet');
    }

    return this._initPromise.then(({ SQL: sql }) => sql);
  }

  protected setApiKey(apiKey: string) {
    if (this._sql === null || this._customStorage === null) {
      throw new Error('Cannot update api key if auth not set yet.');
    }

    this._apiKey = apiKey;
    this._sql.setApiKey(apiKey);
    this._customStorage.setApiKey(apiKey);

    return this._initPromise;
  }

  public get PublicStorageReader(): PublicStorageReader {
    return this._publicStorageReader;
  }

  public get username(): string | null {
    return this._username;
  }

  public get serverUrlTemplate(): string {
    return this._serverUrlTemplate;
  }

  public get namespace(): string {
    return this._namespace;
  }

  public get apiKey(): string | null {
    return this._apiKey;
  }

}

export default App;
