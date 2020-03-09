import { Credentials, MetricsEvent } from '@carto/toolkit-core';
import { SQL } from '@carto/toolkit-sql';
import { CustomStorage } from '../CustomStorage';
import { generateDatasetTableName, generateDatasetVisTableName, generateVisTableName, getVisualization, TableNames } from './utils';

interface SQLClientMap {
  [key: string]: SQL;
}

const DEFAULT_CLIENT = 'keplergl'; // default client app using the storage

const CONTEXT_GET_PUBLIC_VIS = 'public_sql_reader_visualization_load';

export class PublicSQLReader {

  private client: string;

  private _namespace: string;
  private _clientMap: SQLClientMap;
  private _serverUrlTemplate: string;

  private _tableName: string;
  private _datasetTableName: string;
  private _datasetsVisTableName: string;

  constructor(
      namespace: string,
      serverUrlTemplate: string = Credentials.DEFAULT_SERVER_URL_TEMPLATE,
      options: {
        client?: string
      } = {
        client: DEFAULT_CLIENT
      }
    ) {

      this.client = options.client;

      this._namespace = namespace;
      this._clientMap = {};
      this._serverUrlTemplate = serverUrlTemplate;

      this._tableName = generateVisTableName(namespace, true, CustomStorage.version);
      this._datasetTableName = generateDatasetTableName(this._tableName);
      this._datasetsVisTableName = generateDatasetVisTableName(this._tableName);
  }

  public getVisualization(username: string, id: string) {
    if (this._clientMap[username] === undefined) {
      const publicCredentials = new Credentials(username, Credentials.DEFAULT_PUBLIC_API_KEY, this._serverUrlTemplate);
      this._clientMap[username] = new SQL(publicCredentials);
    }

    const tableNames: TableNames = {
      vis: this._tableName,
      datasets: this._datasetTableName,
      visToDatasets: this._datasetsVisTableName
    };

    const event = new MetricsEvent(this._namespace, CONTEXT_GET_PUBLIC_VIS);

    return getVisualization(tableNames, id, this._clientMap[username], { event });
  }
}
