import { SQL } from '@carto/toolkit-sql';
import { DEFAULT_SERVER } from '../constants';
import { CustomStorage } from '../CustomStorage';
import { generateDatasetTableName, generateVisTableName, getVisualization } from './utils';

interface SQLClientMap {
  [key: string]: SQL;
}

export class PublicSQLReader {
  private _clientMap: SQLClientMap;
  private _server: string;
  private _tableName: string;
  private _datasetTableName: string;

  constructor(namespace: string, server: string = DEFAULT_SERVER) {
    this._tableName = generateVisTableName(namespace, true, CustomStorage.version);
    this._datasetTableName = generateDatasetTableName(this._tableName);
    this._server = server;
    this._clientMap = {};
  }

  public getVisualization(username: string, id: string) {
    if (this._clientMap[username] === undefined) {
      this._clientMap[username] = new SQL(username, 'default_public', this._server);
    }

    return getVisualization(this._tableName, this._datasetTableName, id, this._clientMap[username]);
  }
}
