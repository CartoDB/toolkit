import { DEFAULT_SERVER } from './constants';
import { PublicSQLStorage } from './sql/PublicSQLStorage';
import { SQLStorage } from './sql/SQLStorage';
import { CompleteVisualization, Dataset, StorageRepository, StoredVisualization, Visualization } from './StorageRepository';

class CustomStorage implements StorageRepository {
  private _publicSQLStorage: PublicSQLStorage;
  private _privateSQLStorage: SQLStorage;

  constructor(
    tableName: string,
    username: string,
    apiKey: string,
    server: string = DEFAULT_SERVER) {

    this._publicSQLStorage = new PublicSQLStorage(
      `${tableName}_public`,
      username,
      apiKey,
      server,
      this.getVersion()
    );

    this._privateSQLStorage = new SQLStorage(
      `${tableName}_private`,
      username,
      apiKey,
      server,
      this.getVersion(),
      false
    );
  }

  public getVisualizations(): Promise<StoredVisualization[]> {
    return Promise.all([
      this._privateSQLStorage.getVisualizations(),
      this._publicSQLStorage.getVisualizations()
    ]).then((data) => {
      return [...data[0], ...data[1]];
    });
  }

  public getPublicVisualizations(): Promise<StoredVisualization[]> {
    return this._publicSQLStorage.getVisualizations();
  }

  public getPrivateVisualizations(): Promise<StoredVisualization[]> {
    return this._privateSQLStorage.getVisualizations();
  }

  public getVisualization(id: string): Promise<CompleteVisualization | null> {
    // Alternatively: SELECT * from (SELECT * FROM <public_table> UNION SELECT * FROM <private_table>) WHERE id = ${id};
    return Promise.all([
      this._publicSQLStorage.getVisualization(id),
      this._privateSQLStorage.getVisualization(id)
    ]).then((d) => {
      return d[0] || d[1];
    });
  }

  public getPublicVisualization(id: string) {
    return this._publicSQLStorage.getVisualization(id);
  }

  public getPublicDataset(id: string) {
    return this._publicSQLStorage.getDataset(id);
  }

  public deleteVisualization(id: string) {
    return Promise.all([
      this._publicSQLStorage.deleteVisualization(id),
      this._privateSQLStorage.deleteVisualization(id)
    ]).then(() => {
      return true;
    }).catch(() => {
      return false;
    });
  }

  public createVisualization(vis: Visualization, datasets: Dataset[], overwrite: boolean): Promise<any> {
    const target = vis.isPrivate ? this._privateSQLStorage : this._publicSQLStorage;

    return target.createVisualization(vis, datasets, overwrite);
  }

  public updateVisualization(vis: StoredVisualization, datasets: Dataset[]): Promise<any> {
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
}

export default CustomStorage;
