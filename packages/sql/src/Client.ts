import { DEFAULT_SERVER, PUBLIC_API_KEY } from './constants';
import { CopyFromManager } from './CopyFromManager';
import { CopyToManager } from './CopyToManager';
import DDL, { ColumConfig, CreateConfig, DropOptions } from './DDL';
import { QueryManager } from './QueryManager';

export class SQL {
  private _copyToManager: CopyToManager;
  private _queryManager: QueryManager;
  private _copyFromManager: CopyFromManager;
  private _publicQueryManager: QueryManager;
  private _publicRole?: string;

  constructor(username: string, apiKey: string, server: string = DEFAULT_SERVER) {
    const baseServer = server.replace('{user}', username);
    this._copyToManager = new CopyToManager({ username, apiKey, server: baseServer });
    this._queryManager = new QueryManager({ username, apiKey, server: baseServer });
    this._copyFromManager = new CopyFromManager({ username, apiKey, server: baseServer });
    this._publicQueryManager = new QueryManager({ username, apiKey: PUBLIC_API_KEY, server: baseServer });
  }

  public static get DDL() {
    return DDL;
  }

  public copyTo(q: string) {
    return this._copyToManager.query(q);
  }

  public copyFrom(csv: string, tableName: string, fields: string[]) {
    return this._copyFromManager.copy(csv, tableName, fields);
  }

  public exportURL(q: string) {
    return this._copyToManager.copyUrl(q);
  }

  public query(q: string) {
    return this._queryManager.query(q);
  }

  public truncate(tableName: string) {
    return this._queryManager.query(`TRUNCATE ${tableName};`);
  }

  public create(name: string, colConfig: Array<ColumConfig | string>, options: CreateConfig) {
    const query = DDL.create(name, colConfig, options);

    return this._queryManager.query(query);
  }

  public drop(name: string, options: DropOptions) {
    const query = DDL.drop(name, options);

    return this._queryManager.query(query);
  }

  public async grantPublicRead(tableName: string) {
    const role = this._publicRole || await this.getRole();

    return this.grantReadToRole(tableName, role);
  }

  public grantReadToRole(tableName: string, role: string = 'publicuser') {
    const query = `GRANT SELECT on ${tableName} TO "${role}"`;

    return this.query(query);
  }

  public transaction(queries: string[]) {
    const query = `
      BEGIN;
        ${queries.join('\n')}
      COMMIT;
    `;

    return this._queryManager.query(query);
  }

  private getRole(): Promise<string> {
    return this._publicQueryManager.query(`
      SELECT current_user as rolename
    `).then((data: any) => {
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
