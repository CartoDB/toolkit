import { SQL } from '@carto/toolkit-sql/dist/types/Client';
import { ColumConfig } from '@carto/toolkit-sql/dist/types/DDL';
import { DuplicatedDatasetsError } from '../errors/DuplicatedDataset';
import { CompleteVisualization, Dataset, StoredVisualization, Visualization } from '../StorageRepository';

function rowToVisualization(row: any) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    thumbnail: row.thumbnail,
    isPrivate: row.private,
    config: row.config
  };
}

const VIS_FIELDS: ColumConfig[] = [
  { name: 'id', type: 'uuid', extra: 'PRIMARY KEY DEFAULT toolkit_create_uuid()' },
  { name: 'name', type: 'text', extra: 'NOT NULL' },
  { name: 'description', type: 'text' },
  { name: 'thumbnail', type: 'text' },
  { name: 'private', type: 'boolean' },
  { name: 'config', type: 'json' }
];

const FIELD_NAMES = VIS_FIELDS.map((field) => field.name);

export class SQLStorage {
  protected _tableName: string;
  private _sql: SQL;
  private _isPublic: boolean;
  private _isReady: boolean = false;

  constructor(
    tableName: string,
    sqlClient: SQL,
    version: number,
    isPublic: boolean) {
    this._tableName = `${tableName}_v${version}`;
    this._isPublic = isPublic;

    this._sql = sqlClient;
  }

  public init() {
    return this._checkTable();
  }

  public getVisualizations(sqlClient?: SQL): Promise<StoredVisualization[]> {
    const client = sqlClient || this._sql;

    return client.query(`
      SELECT ${FIELD_NAMES.filter((name) => name !== 'config').join(', ')}
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

  public async getVisualization(id: string, sqlClient?: SQL): Promise<CompleteVisualization | null> {
    const client = sqlClient || this._sql;

    const response: any = await client.query(`SELECT * FROM ${this._tableName} WHERE id = '${id}'`);

    if (response.error) {
      throw new Error(response.error);
    }

    if (response.rows.length === 0) {
      return null;
    }

    const vis = rowToVisualization(response.rows[0]);

    const datasetsForViz = await this.getDatasetsForVis(id, client);

    if (datasetsForViz.length === 0) {
      return {
        vis,
        datasets: []
      };
    }

    // Download each dataset
    const datasets: Dataset[] = await Promise.all(
      datasetsForViz.map((dataset: any) => this.getDataset(dataset))
    );

    return {
      vis,
      datasets
    };
  }

  public async getDataset(name: string, sqlClient?: SQL): Promise<Dataset> {
    const client = sqlClient || this._sql;

    const response: string | any = await client.query(`SELECT * FROM ${name}`, [['format', 'csv']]);

    // Something wrong has happened
    if (typeof response !== 'string') {
      throw new Error(response.error);
    }

    return {
      name,
      file: response
    };
  }

  public async deleteVisualization(id: string): Promise<void> {
    const datasetsForViz = await this.getDatasetsForVis(id);

    // Delete related datasets (non-cartodbified ones)
    if (datasetsForViz.length > 0) {
      await Promise.all(datasetsForViz.map((dataset) => this._sql.drop(dataset, { ifExists: true })));
    }

    // Delete visualization
    await this._sql.query(`DELETE FROM ${this._tableName} WHERE id='${id}'`);
  }

  public async createVisualization(
    vis: Visualization,
    datasets: Dataset[],
    overwrite: boolean = false): Promise<boolean> {

    const existingTables = await this.checkExistingTables(datasets.map((dataset) => dataset.name));

    if (!overwrite) {

      if (existingTables.length > 0) {
        throw new DuplicatedDatasetsError(existingTables);
      }
    }

    if (overwrite && existingTables.length > 0) {
      await Promise.all(
        existingTables.map((name) => this._sql.drop(name, { ifExists: true }))
      );
    }

    // Insert Visualization into table
    const insertResult: any = await this._sql.query(`INSERT INTO ${this._tableName}
      (${FIELD_NAMES.join(', ')})
      VALUES
      (
        toolkit_create_uuid(),
        ${this.escapeOrNull(vis.name)},
        ${this.escapeOrNull(vis.description)},
        ${this.escapeOrNull(vis.thumbnail)},
        ${vis.isPrivate},
        ${this.escapeOrNull(vis.config)}
      )
      RETURNING id
    `);

    if (insertResult.error) {
      return false;
    }

    const id = insertResult.rows[0].id;

    for (const dataset of datasets) {
      await this.uploadDataset(dataset, id);

      // Creating the cartodbified version
      // BEGIN;
      // CREATE TABLE <tableName_cartodbified> AS (select * from previousTable);
      // We'll need some extra user info for this step, fetch this early on.
      // CARTODBFY(...);
      // END;

      // GRANT READ to datasets
      if (!vis.isPrivate) {
        this._sql.grantPublicRead(`${this._tableName}_${dataset.name}`);
      }
    }


    return true;
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

  private async checkIfTableExists(tableName: string): Promise<string | null> {
    const result: any = await this._sql.query(`SELECT * FROM ${tableName}`);

    if (result.error) {
      return null;
    }

    return tableName;
  }

  private async checkExistingTables(tableNames: string[]): Promise<string[]> {
    const result = await Promise.all(
      tableNames.map(
        (name) => this.checkIfTableExists(`${this._tableName}_${name}`)
      )
    );

    return result.filter((element): element is string => element !== null);
  }

  private escapeOrNull(what: string) {
    if (what == null) {
      return null;
    }

    return `'${what}'`;
  }

  private async uploadDataset(dataset: Dataset, visId?: string): Promise<void> {
    if (!dataset.columns) {
      throw new Error('Need dataset column information');
    }

    const tableName = `${this._tableName}_${dataset.name}`;

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

    if (visId !== undefined) {
      const insertResult: any = await this._sql.query(`
        INSERT INTO ${this._tableName}_datasets (vis, name) VALUES ('${visId}', '${tableName}')
      `);

      if (insertResult.error) {
        throw new Error(`Failed to register dataset ${tableName} ${insertResult.error}`);
      }
    }
  }

  private async getDatasetsForVis(visId: string, client?: SQL): Promise<string[]> {
    const datasetsResp: any = await (client || this._sql).query(`SELECT * FROM ${this._tableName}_datasets WHERE vis = '${visId}'`);

    if (datasetsResp.error) {
      throw new Error(datasetsResp.error);
    }

    return datasetsResp.rows.map((row: any) => row.name);
  }

  private async _checkTable() {
    const datasetsColumns = [
      `vis uuid references ${this._tableName}(id) ON DELETE CASCADE`,
      `name text`
    ];

    await this._sql.create(this._tableName, VIS_FIELDS, {
      ifNotExists: true
    });

    const datasetsTableName = `${this._tableName}_datasets`;
    await this._sql.create(datasetsTableName, datasetsColumns, {
      ifNotExists: true
    });

    // TODO: If they are already granted, no point in following
    if (this._isPublic) {
      await this._sql.grantPublicRead(this._tableName);
      await this._sql.grantPublicRead(datasetsTableName);
    }

    this._isReady = true;
  }
}

