import { Credentials, MetricsEvent } from '@carto/toolkit-core';
import { Constants, SQL } from '@carto/toolkit-sql';
import { SQLStorage } from './sql/SQLStorage';
import {
  CompleteVisualization,
  Dataset,
  StorageRepository,
  StoredDataset,
  StoredVisualization,
  Visualization
} from './StorageRepository';

const CONTEXT_INIT = 'custom_storage_init';
const CONTEXT_CREATE_VIS = 'custom_storage_visualization_create';
const CONTEXT_UPDATE_VIS = 'custom_storage_visualization_update';
const CONTEXT_DELETE_VIS = 'custom_storage_visualization_delete';
const CONTEXT_GET_ALL_VIS = 'custom_storage_visualization_list_load';
const CONTEXT_GET_PUBLIC_VIS = 'custom_storage_public_visualizations_load';
const CONTEXT_GET_PRIVATE_VIS = 'custom_storage_private_visualizations_load';
const CONTEXT_GET_VIS = 'custom_storage_visualization_load';

export class CustomStorage implements StorageRepository {
  public static version: number = 0;

  private _publicSQLStorage: SQLStorage;
  private _privateSQLStorage: SQLStorage;
  private _sqlClient: SQL;
  private _namespace: string;

  constructor(
    namespace: string,
    credentials: Credentials,
    maxApiRequestsRetries: number = Constants.DEFAULT_MAX_API_REQUESTS_RETRIES) {

    this._sqlClient = new SQL(credentials, { maxApiRequestsRetries });
    this._checkNamespace(namespace);

    this._namespace = namespace;

    this._publicSQLStorage = new SQLStorage(
      this._namespace,
      this._sqlClient,
      this.getVersion(),
      true
    );

    this._privateSQLStorage = new SQLStorage(
      this._namespace,
      this._sqlClient,
      this.getVersion(),
      false
    );
  }

  public async init() {
    if (this.isInitialized()) {
      return true;
    }

    await this._sqlClient.query(`
      BEGIN;
        CREATE OR REPLACE FUNCTION ${this._namespace}_create_uuid()
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

    const event = new MetricsEvent(this._namespace, CONTEXT_INIT);
    const inits = await Promise.all([this._publicSQLStorage.init({ event }), this._privateSQLStorage.init({ event })]);

    const storageHasBeenInitialized = inits[0] || inits[1];
    return storageHasBeenInitialized;
  }

  private isInitialized() {
    return this._publicSQLStorage.isInitialized();
  }

  public getVisualizations(): Promise<StoredVisualization[]> {
    this._checkReady();

    const event = new MetricsEvent(this._namespace, CONTEXT_GET_ALL_VIS);
    return Promise.all([
      this._privateSQLStorage.getVisualizations({ event }),
      this._publicSQLStorage.getVisualizations({ event })
    ]).then((data) => {
      return [...data[0], ...data[1]];
    });
  }

  public getPublicVisualizations(): Promise<StoredVisualization[]> {
    this._checkReady();

    const event = new MetricsEvent(this._namespace, CONTEXT_GET_PUBLIC_VIS);
    return this._publicSQLStorage.getVisualizations({ event });
  }

  public getPrivateVisualizations(): Promise<StoredVisualization[]> {
    this._checkReady();

    const event = new MetricsEvent(this._namespace, CONTEXT_GET_PRIVATE_VIS);
    return this._privateSQLStorage.getVisualizations({ event });
  }

  public getVisualization(id: string): Promise<CompleteVisualization | null> {
    this._checkReady();

    const event = new MetricsEvent(this._namespace, CONTEXT_GET_VIS);

    // Alternatively: SELECT * from (SELECT * FROM <public_table> UNION SELECT * FROM <private_table>) WHERE id = ${id};
    return Promise.all([
      this._publicSQLStorage.getVisualization(id, { event }),
      this._privateSQLStorage.getVisualization(id, { event })
    ]).then((d) => {
      return d[0] || d[1];
    });
  }

  // TODO: optimize by splitting into two methods because clients will know the type of vis it is
  public deleteVisualization(id: string) {
    this._checkReady();

    const event = new MetricsEvent(this._namespace, CONTEXT_DELETE_VIS);

    return Promise.all([
      this._publicSQLStorage.deleteVisualization(id, { event }),
      this._privateSQLStorage.deleteVisualization(id, { event })
    ]).then(() => {
      return true;
    }).catch(() => {
      return false;
    });
  }

  public createVisualization(
    vis: Visualization,
    datasets: Array<Dataset | string>,
    overwriteDatasets: boolean): Promise<StoredVisualization | null> {
    this._checkReady();

    const target = vis.isPrivate ? this._privateSQLStorage : this._publicSQLStorage;

    const event = new MetricsEvent(this._namespace, CONTEXT_CREATE_VIS);
    return target.createVisualization(vis, datasets, { overwriteDatasets, event });
  }

  public updateVisualization(vis: StoredVisualization, datasets: Dataset[]): Promise<StoredVisualization | null> {
    this._checkReady();

    const target = vis.isPrivate ? this._privateSQLStorage : this._publicSQLStorage;

    const event = new MetricsEvent(this._namespace, CONTEXT_UPDATE_VIS);
    return target.updateVisualization(vis, datasets, { event });
  }

  public getDatasets(): Promise<StoredDataset[]> {
    return Promise.all([this._publicSQLStorage.getDatasets(), this._privateSQLStorage.getDatasets()])
      .then((result) => {
        return [
          ...result[0], ...result[1]
        ];
      });
  }

  public getVisForDataset(datasetName: string) {
    return Promise.all([
      this._publicSQLStorage.getVisForDataset(datasetName),
      this._privateSQLStorage.getVisForDataset(datasetName)
    ])
    .then((result) => {
      return [
        ...result[0], ...result[1]
      ];
    });
  }

  public uploadPublicDataset(dataset: Dataset, overwrite: boolean = false) {
    return this._uploadDataset(dataset, this._publicSQLStorage, true, overwrite);
  }

  public uploadPrivateDataset(dataset: Dataset, overwrite: boolean = false) {
    return this._uploadDataset(dataset, this._privateSQLStorage, false, overwrite);
  }

  public getVersion() {
    return CustomStorage.version;
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
    await this._sqlClient.query(`DROP FUNCTION ${this._namespace}_create_uuid CASCADE;`);
    await this._privateSQLStorage.destroy();
    await this._publicSQLStorage.destroy();
  }

  /**
   * Check namespace, as it will be used internally to create database-related elements
   *
   * @private
   * @param {string} namespace
   * @memberof CustomStorage
   */
  private _checkNamespace(namespace: string) {

    if ((namespace.split(' ').length > 1)) {
      throw new Error ('Namespace for custom-storage must be 1 word');
    }
  }

  private _checkReady() {
    if (!this._privateSQLStorage.isReady || !this._publicSQLStorage.isReady) {
      throw new Error('.init has not finished');
    }
  }

  private async _uploadDataset(dataset: Dataset, storage: SQLStorage, isPublic: boolean, overwrite: boolean) {
    const storedDataset = await storage.uploadDataset(dataset, { overwrite });

    if (isPublic) {
      await storage.shareDataset(storedDataset.tablename);
    }

    return storedDataset;
  }
}
