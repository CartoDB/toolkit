import { Credentials, MetricsEvent } from '@carto/toolkit-core';
import { CopyFromManager } from './CopyFromManager';
import { CopyToManager } from './CopyToManager';
import DDL, { ColumConfig, CreateConfig, DropOptions } from './DDL';
import { Pair, QueryManager } from './QueryManager';

const PUBLIC_USER = 'publicuser';

export class SQL {
  private _copyToManager: CopyToManager;
  private _queryManager: QueryManager;
  private _copyFromManager: CopyFromManager;
  private _publicQueryManager: QueryManager;

  private _publicRole?: string;
  private _credentials: Credentials;

  constructor(
    credentials: Credentials,
    { maxApiRequestsRetries }: { maxApiRequestsRetries?: number } = {}
  ) {
    this._credentials = credentials;

    this._copyToManager = new CopyToManager(this._credentials, { maxApiRequestsRetries });
    this._queryManager = new QueryManager(this._credentials, { maxApiRequestsRetries });
    this._copyFromManager = new CopyFromManager(this._credentials, { maxApiRequestsRetries });

    const publicCredentials = new Credentials(
      credentials.username,
      Credentials.DEFAULT_PUBLIC_API_KEY,
      credentials.serverUrlTemplate
    );
    this._publicQueryManager = new QueryManager(publicCredentials, { maxApiRequestsRetries });
  }

  public static get DDL() {
    return DDL;
  }

  public copyFrom(csv: string, tableName: string, fields: string[], options: { event?: MetricsEvent } = {}) {
    return this._copyFromManager.copy(csv, tableName, fields, options);
  }

  public exportURL(q: string) {
    return this._copyToManager.copyUrl(q);
  }

  public query(
    q: string,
    options: {
       extraParams?: Array<Pair<string>>,
       event?: MetricsEvent
      } = {} ) {

    const cleanQuery = q.replace(/\s+/g, ' ').trim();
    return this._queryManager.query(cleanQuery, options);
  }

  public truncate(tableName: string) {
    return this._queryManager.query(`TRUNCATE ${tableName};`);
  }

  public create(
    name: string,
    colConfig: Array<ColumConfig | string>,
    options: {
      createOptions?: CreateConfig,
      event?: MetricsEvent
    } = {}) {

    const query = DDL.create(name, colConfig, options.createOptions);
    return this._queryManager.query(query, { event: options.event });
  }

  public drop(
    name: string,
    options: {
      dropOptions?: DropOptions,
      event?: MetricsEvent
    } = {}
    ) {

    const query = DDL.drop(name, options.dropOptions);
    return this._queryManager.query(query, { event: options.event });
  }

  public async grantPublicRead(tableName: string, options: { event?: MetricsEvent } = {}) {
    const role = this._publicRole || await this.getRole(options);

    return this.grantReadToRole(tableName, role, options);
  }

  public grantReadToRole(tableName: string, role: string = PUBLIC_USER,  options: { event?: MetricsEvent } = {}) {
    const query = `GRANT SELECT on ${tableName} TO "${role}"`;

    return this.query(query, options);
  }

  public transaction(queries: string[]) {
    const query = `
      BEGIN;
        ${queries.join('\n')}
      COMMIT;
    `;

    return this._queryManager.query(query);
  }

  public setApiKey(apiKey: string) {
    this._credentials.apiKey = apiKey;

    this._queryManager.apiKey = apiKey;
    this._copyToManager.apiKey = apiKey;
    this._copyFromManager.apiKey = apiKey;
  }

  private getRole(options: { event?: MetricsEvent } = {}): Promise<string> {
    return this._publicQueryManager
      .query(`SELECT current_user as rolename`, options)
      .then((data: any) => {
        if (data.error) {
          throw new Error(data.error);
        }

        if (data.rows.length === 0) {
          throw new Error('Cannot grant: got no current_user data');
        }

        const { rolename } = data.rows[0];

        this._publicRole = rolename;

        return rolename;
      });
  }
}
