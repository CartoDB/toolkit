import { SQL } from '@carto/toolkit-sql/dist/types/Client';
import { ColumConfig } from '@carto/toolkit-sql/dist/types/DDL';
import { DuplicatedDatasetsError } from '../errors/DuplicatedDataset';
import {
  CompleteVisualization,
  Dataset,
  StoredDataset,
  StoredVisualization,
  Visualization } from '../StorageRepository';
import {
  generateDatasetTableName,
  generateDatasetVisTableName,
  generateVisTableName,
  getDataset,
  getVisualization,
  rowToVisualization} from './utils';

export class SQLStorage {
  protected _tableName: string;
  protected _datasetsTableName: string;
  protected _datasetsVisTableName: string;
  private _sql: SQL;
  private _isPublic: boolean;
  private _isReady: boolean = false;
  private _namespace: string;
  private VIS_FIELDS: ColumConfig[];
  private DATASET_COLUMNS: string[];
  private DATASET_VIS_COLUMNS: string[];
  private FIELD_NAMES: string[];

  constructor(
    tableName: string,
    sqlClient: SQL,
    version: number,
    isPublic: boolean) {
    this._namespace = tableName;
    this._tableName = generateVisTableName(tableName, isPublic, version);
    this._datasetsTableName = generateDatasetTableName(this._tableName);
    this._datasetsVisTableName = generateDatasetVisTableName(this._tableName);
    this._isPublic = isPublic;

    this.VIS_FIELDS = [
      { name: 'id', type: 'uuid', extra: `PRIMARY KEY DEFAULT ${this._namespace}_create_uuid()` },
      { name: 'name', type: 'text', extra: 'NOT NULL' },
      { name: 'description', type: 'text' },
      { name: 'thumbnail', type: 'text' },
      { name: 'private', type: 'boolean' },
      { name: 'config', type: 'json' }
    ];

    this.DATASET_COLUMNS = [
      `id uuid PRIMARY KEY DEFAULT ${this._namespace}_create_uuid()`,
      `tablename text UNIQUE NOT NULL`,
      `name text UNIQUE NOT NULL`
    ];

    this.DATASET_VIS_COLUMNS = [
      `vis uuid references ${this._tableName}(id) ON DELETE CASCADE`,
      `dataset uuid references ${this._datasetsTableName}(id) ON DELETE CASCADE`
    ];

    this.FIELD_NAMES = this.VIS_FIELDS.map((field) => field.name);

    this._sql = sqlClient;
  }

  public init() {
    return this._checkTable();
  }

  public getVisualizations(sqlClient?: SQL): Promise<StoredVisualization[]> {
    const client = sqlClient || this._sql;

    return client.query(`
      SELECT ${this.FIELD_NAMES.filter((name) => name !== 'config').join(', ')}
      FROM ${this._tableName}
      `).then((response: any) => {

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.rows.length === 0) {
        return [];
      }

      return response.rows.map(rowToVisualization);
    });
  }

  public async getVisualization(id: string): Promise<CompleteVisualization | null> {
    return getVisualization(this._tableName, this._datasetsTableName, this._datasetsVisTableName, id, this._sql);
  }

  public async getDataset(name: string): Promise<Dataset> {
    return getDataset(name, this._sql);
  }

  public async getDatasets(): Promise<StoredDataset[]> {
    const result: any = await this._sql.query(`
      SELECT * FROM ${this._datasetsTableName}
    `);

    if (result.error) {
      throw new Error('Failed to read datasets');
    }

    return result.rows;
  }

  public async getVisForDataset(datasetId: string): Promise<StoredVisualization[]> {
    const result: any = await this._sql.query(`
      WITH dataset_vis as (SELECT * FROM ${this._datasetsVisTableName} WHERE dataset = '${datasetId}')

      SELECT t.name, t.id, t.thumbnail, t.private
      FROM ${this._tableName} t, dataset_vis u WHERE t.id = u.vis
    `);

    if (result.error) {
      throw new Error('Failed to read visualizations');
    }

    return result.rows.map(rowToVisualization);
  }

  public async deleteVisualization(id: string): Promise<void> {
    // Delete visualization
    await this._sql.query(`DELETE FROM ${this._tableName} WHERE id='${id}'`);
  }

  public async deleteDataset() {
    // Find all related visualizations
    // Delete them
    // Delete the dataset
  }

  public async createVisualization(
    vis: Visualization,
    datasets: Dataset[],
    overwrite: boolean = false): Promise<StoredVisualization | null> {

    const existingTables = await this.checkExistingDataset(datasets.map((dataset) => dataset.name));

    if (!overwrite) {

      if (existingTables.length > 0) {
        throw new DuplicatedDatasetsError(existingTables.map((dataset) => dataset.name));
      }
    }

    if (overwrite && existingTables.length > 0) {
      await Promise.all(
        existingTables.map((table) =>
          this._sql.query(`
            BEGIN;
              DROP TABLE IF EXISTS ${table.tablename};
              DELETE FROM ${this._datasetsTableName} WHERE id = '${table.id}'
            COMMIT;
          `)
        )
      );
    }

    // Insert Visualization into table
    const insertResult: any = await this._sql.query(`INSERT INTO ${this._tableName}
      (${this.FIELD_NAMES.join(', ')})
      VALUES
      (
        ${this._namespace}_create_uuid(),
        ${this.escapeOrNull(vis.name)},
        ${this.escapeOrNull(vis.description)},
        ${this.escapeOrNull(vis.thumbnail)},
        ${vis.isPrivate === undefined ? false : vis.isPrivate},
        ${this.escapeOrNull(vis.config)}
      )
      RETURNING id
    `);

    if (insertResult.error) {
      return null;
    }

    const id = insertResult.rows[0].id;

    for (const dataset of datasets) {
      const tableName = `${this._tableName}_${dataset.name}`;
      const datasetId = await this.uploadDataset(dataset, tableName);

      await this.linkVisAndDataset(id, datasetId);

      // Creating the cartodbified version
      // BEGIN;
      // CREATE TABLE <tableName_cartodbified> AS (select * from previousTable);
      // We'll need some extra user info for this step, fetch this early on.
      // CARTODBFY(...);
      // END;

      // GRANT READ to datasets
      if (!vis.isPrivate) {
        this._sql.grantPublicRead(tableName);
      }
    }


    return {
      id,
      ...vis
    };
  }

  public updateVisualization(_visualization: StoredVisualization, _datasets: Dataset[]): Promise<any> {
    throw new Error(`Method not implemented.`);

    // Insert visualization into table (update)

    // Delete old non-cartodbified datasets

    // Upload all datasets

    // Duplicate datasets and cartodbfy them

    // GRANT READ to datasets
  }

  public get isReady(): boolean {
    return this._isReady;
  }

  public setApiKey(apiKey: string) {
    this._sql.setApiKey(apiKey);
  }

  public async destroy() {
    const rawDatasets = await this.getDatasets();

    const datasets: string[] = rawDatasets.map((row: { name: string }) => row.name);

    return this._sql.query(`
      BEGIN;
        ${datasets.map((datasetName) => `DROP TABLE IF EXISTS ${datasetName};`).join('\n')}
        DROP TABLE IF EXISTS ${this._tableName} CASCADE;
        DROP TABLE IF EXISTS ${this._datasetsTableName} CASCADE;
        DROP TABLE IF EXISTS ${this._datasetsVisTableName} CASCADE;
      COMMIT;
    `);
  }

  private async checkIfDatasetExists(datasetName: string): Promise<StoredDataset | null> {
    const result: any = await this._sql.query(`SELECT * FROM ${this._datasetsTableName} WHERE name = '${datasetName}'`);

    if (result.error) {
      return null;
    }

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  private async checkExistingDataset(tableNames: string[]): Promise<StoredDataset[]> {
    const result = await Promise.all(
      tableNames.map(
        (name) => this.checkIfDatasetExists(name)
      )
    );

    return result.filter((element): element is StoredDataset => element !== null);
  }

  private escapeOrNull(what: string) {
    if (what == null) {
      return null;
    }

    return `'${what}'`;
  }

  private async linkVisAndDataset(visId: string, datasetId: string) {
    const insertResult: any = await this._sql.query(`
      INSERT INTO ${this._datasetsVisTableName} (vis, dataset)
      VALUES ('${visId}', '${datasetId}')
    `);

    if (insertResult.error) {
      throw new Error('Failed to link dataset id to vis id');
    }
  }

  private async uploadDataset(dataset: Dataset, tableName: string): Promise<string> {
    if (!dataset.columns) {
      throw new Error('Need dataset column information');
    }

    const result: any = await this._sql.create(tableName, dataset.columns, { ifNotExists: false });

    if (result.error) {
      throw new Error(`Failed to create table for dataset ${dataset.name}: ${result.error}`);
    }

    const copyResult: any = await this._sql.copyFrom(dataset.file, tableName, dataset.columns.map((column) => {
      if (typeof column === 'string') {
        return column;
      }

      return column.name;
    }));

    if (copyResult.error) {
      throw new Error(`Failed to copy to ${tableName}: ${copyResult.error}`);
    }

    const insertResult: any = await this._sql.query(`
      INSERT INTO ${this._datasetsTableName} (id, name, tablename)
      VALUES (${this._namespace}_create_uuid(), '${dataset.name}', '${tableName}')
      RETURNING id
    `);

    if (insertResult.error) {
      throw new Error(`Failed to register dataset ${tableName} ${insertResult.error}`);
    }

    return insertResult.rows[0].id;
  }

  private async _checkTable() {
    await this._sql.create(this._tableName, this.VIS_FIELDS, {
      ifNotExists: true
    });

    await this._sql.create(this._datasetsTableName, this.DATASET_COLUMNS, {
      ifNotExists: true
    });

    await this._sql.create(this._datasetsVisTableName, this.DATASET_VIS_COLUMNS, {
      ifNotExists: true
    });

    // TODO: If they are already granted, no point in following
    if (this._isPublic) {
      await this._sql.grantPublicRead(this._tableName);
      await this._sql.grantPublicRead(this._datasetsTableName);
      await this._sql.grantPublicRead(this._datasetsVisTableName);
    }

    this._isReady = true;
  }
}

