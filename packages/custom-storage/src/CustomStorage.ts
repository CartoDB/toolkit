import { SQL } from '@carto/toolkit-sql';
import { DEFAULT_SERVER } from './constants';
import { PublicSQLStorage } from './sql/PublicSQLStorage';
import { SQLStorage } from './sql/SQLStorage';
import { CompleteVisualization, Dataset, StorageRepository, StoredVisualization, Visualization } from './StorageRepository';

export class CustomStorage implements StorageRepository {
  private _publicSQLStorage: PublicSQLStorage;
  private _privateSQLStorage: SQLStorage;
  private _sqlClient: SQL;
  private _tableName: string;

  constructor(
    tableName: string,
    username: string,
    apiKey: string,
    server: string = DEFAULT_SERVER) {

    this._sqlClient = new SQL(username, apiKey, server);
    this._tableName = tableName;

    this._publicSQLStorage = new PublicSQLStorage(
      `${this._tableName}`,
      this._sqlClient,
      this.getVersion()
    );

    this._privateSQLStorage = new SQLStorage(
      `${this._tableName}`,
      this._sqlClient,
      this.getVersion(),
      false
    );
  }

  public async init() {
    await this._sqlClient.query(`
      BEGIN;
        CREATE OR REPLACE FUNCTION ${this._tableName}_create_uuid()
        RETURNS UUID AS
        $$
        DECLARE
          _output UUID;
        BEGIN
          SELECT uuid_in(md5(random()::text || clock_timestamp()::text)::cstring) INTO _output;
          RETURN _output;
        END
        $$ LANGUAGE plpgsql PARALLEL SAFE;
      COMMIT;
    `);

    await Promise.all([this._publicSQLStorage.init(), this._privateSQLStorage.init()]);
  }

  public getVisualizations(): Promise<StoredVisualization[]> {
    this._checkReady();

    return Promise.all([
      this._privateSQLStorage.getVisualizations(),
      this._publicSQLStorage.getVisualizations()
    ]).then((data) => {
      return [...data[0], ...data[1]];
    });
  }

  public getPublicVisualizations(): Promise<StoredVisualization[]> {
    this._checkReady();

    return this._publicSQLStorage.getVisualizations();
  }

  public getPrivateVisualizations(): Promise<StoredVisualization[]> {
    this._checkReady();

    return this._privateSQLStorage.getVisualizations();
  }

  public getVisualization(id: string): Promise<CompleteVisualization | null> {
    this._checkReady();

    // Alternatively: SELECT * from (SELECT * FROM <public_table> UNION SELECT * FROM <private_table>) WHERE id = ${id};
    return Promise.all([
      this._publicSQLStorage.getVisualization(id),
      this._privateSQLStorage.getVisualization(id)
    ]).then((d) => {
      return d[0] || d[1];
    });
  }

  public getPublicVisualization(id: string) {
    this._checkReady();

    return this._publicSQLStorage.getVisualization(id);
  }

  public getPublicDataset(id: string) {
    this._checkReady();

    return this._publicSQLStorage.getDataset(id);
  }

  public deleteVisualization(id: string) {
    this._checkReady();

    return Promise.all([
      this._publicSQLStorage.deleteVisualization(id),
      this._privateSQLStorage.deleteVisualization(id)
    ]).then(() => {
      return true;
    }).catch(() => {
      return false;
    });
  }

  public createVisualization(
    vis: Visualization,
    datasets: Dataset[],
    overwrite: boolean): Promise<StoredVisualization | null> {
    this._checkReady();

    const target = vis.isPrivate ? this._privateSQLStorage : this._publicSQLStorage;

    return target.createVisualization(vis, datasets, overwrite);
  }

  public updateVisualization(vis: StoredVisualization, datasets: Dataset[]): Promise<any> {
    this._checkReady();

    const target = vis.isPrivate ? this._privateSQLStorage : this._publicSQLStorage;

    return target.updateVisualization(vis, datasets);
  }

  public getVersion() {
    return 0;
  }

  public migrate() {
    // Version 0 does not need to migrate anything.
    // Future versions should implement this to migrate from 0 to this.getVersion()
    return Promise.resolve();
  }

  public getSQLClient(): SQL {
    return this._sqlClient;
  }

  public setApiKey(apiKey: string) {
    this._sqlClient.setApiKey(apiKey);
    this._privateSQLStorage.setApiKey(apiKey);
    this._publicSQLStorage.setApiKey(apiKey);
  }

  public async destroy() {
    await this._sqlClient.query(`DROP FUNCTION ${this._tableName}_create_uuid CASCADE;`);
    await this._privateSQLStorage.destroy();
    await this._publicSQLStorage.destroy();
  }

  private _checkReady() {
    if (!this._privateSQLStorage.isReady || !this._publicSQLStorage.isReady) {
      throw new Error('.init has not finished');
    }
  }
}
