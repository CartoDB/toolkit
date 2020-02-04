import { Credentials } from '@carto/toolkit-core';
import { SQL } from '@carto/toolkit-sql';
import { CustomStorage } from '../CustomStorage';
import { generateDatasetTableName, generateDatasetVisTableName, generateVisTableName, getVisualization } from './utils';

interface SQLClientMap {
  [key: string]: SQL;
}

export class PublicSQLReader {
  private _clientMap: SQLClientMap;
  private _serverUrlTemplate: string;
  private _tableName: string;
  private _datasetTableName: string;
  private _datasetsVisTableName: string;

  constructor(namespace: string, serverUrlTemplate: string = Credentials.DEFAULT_SERVER_URL_TEMPLATE) {
    this._tableName = generateVisTableName(namespace, true, CustomStorage.version);
    this._datasetTableName = generateDatasetTableName(this._tableName);
    this._datasetsVisTableName = generateDatasetVisTableName(this._tableName);
    this._serverUrlTemplate = serverUrlTemplate;
    this._clientMap = {};
  }

  public getVisualization(username: string, id: string) {
    if (this._clientMap[username] === undefined) {
      this._clientMap[username] = new SQL(username, Credentials.DEFAULT_PUBLIC_API_KEY, this._serverUrlTemplate);
    }

    return getVisualization(
      this._tableName,
      this._datasetTableName,
      this._datasetsVisTableName,
      id,
      this._clientMap[username]
    );
  }
}
