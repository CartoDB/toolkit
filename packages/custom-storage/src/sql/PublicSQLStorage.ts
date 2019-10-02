import { SQL } from '@carto/toolkit-sql';
import { DEFAULT_API_KEY } from '../constants';
import { CompleteVisualization } from '../StorageRepository';
import { SQLStorage } from './SQLStorage';

export class PublicSQLStorage extends SQLStorage {
  private _publicSQL: SQL;

  constructor(
    tableName: string,
    sqlClient: SQL,
    version: number) {
    super(tableName, sqlClient, version, true);

    this._publicSQL = new SQL(sqlClient.username, DEFAULT_API_KEY, sqlClient.server);
  }

  public getVisualizations() {
    return super.getVisualizations(this._publicSQL);
  }

  public getVisualization(id: string): Promise<CompleteVisualization | null> {
    return super.getVisualization(id, this._publicSQL);
  }

  public getDataset(id: string) {
    return super.getDataset(id, this._publicSQL);
  }

  public setApiKey(apiKey: string) {
    super.setApiKey(apiKey);
    this._publicSQL.setApiKey(apiKey);
  }
}
