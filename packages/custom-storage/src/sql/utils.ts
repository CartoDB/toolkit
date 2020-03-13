import { MetricsEvent } from '@carto/toolkit-core';
import { SQL } from '@carto/toolkit-sql';
import { CompleteVisualization, Dataset, StoredDataset, StoredVisualization } from '../StorageRepository';

type Pair<T> = [T, T];

export interface TableNames {
  vis: string;
  datasets: string;
  visToDatasets: string;
}

export function rowToVisualization(row: any): StoredVisualization {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    thumbnail: row.thumbnail,
    isprivate: row.isprivate,
    config: row.config,
    lastmodified: row.lastmodified
  };
}

/**
 * Get dataset file as CSV from SQL API
 *
 * TODO. Consider the use of copyTo API
 */
export async function getDatasetData(
  name: string,
  tablename: string,
  client: SQL,
  options: {
    event?: MetricsEvent
  } = {}
  ): Promise<Dataset> {

  const csvFormat: Array<Pair<string>> = [['format', 'csv']];
  const queryOptions = {
    extraParams: csvFormat,
    event: options.event
  };
  const response: string | any = await client.query(`SELECT * FROM ${tablename}`, queryOptions);

  // Something wrong has happened
  if (typeof response !== 'string') {
    throw new Error(response.error);
  }

  return {
    name,
    file: response
  };
}

export async function getDatasetsForVis(
  tableNames: TableNames,
  visId: string,
  client: SQL,
  options: {
    event?: MetricsEvent
  } = {}
  ): Promise<StoredDataset[]> {

  const datasetsResp: any = await (client).query(`
    WITH datasets AS (SELECT dataset FROM ${tableNames.visToDatasets} WHERE vis = '${visId}')
    SELECT t.id, t.name, t.tablename FROM ${tableNames.datasets} t, datasets u
    WHERE t.id = u.dataset
  `, options);

  if (datasetsResp.error) {
    throw new Error(datasetsResp.error);
  }

  return datasetsResp.rows;
}


export async function getVisualization(
  tableNames: TableNames,
  id: string,
  client: SQL,
  options: {
    event?: MetricsEvent
  } = {}
): Promise<CompleteVisualization | null> {

  // The visualization
  const response: any = await client.query(`SELECT * FROM ${tableNames.vis} WHERE id = '${id}'`, options);

  if (response.error) {
    throw new Error(response.error);
  }
  if (response.rows.length === 0) {
    return null;
  }
  const vis = rowToVisualization(response.rows[0]);

  // The relation table between visualization & datasets
  const datasetsForViz = await getDatasetsForVis(tableNames, id, client, options);
  if (datasetsForViz.length === 0) {
    return {
      vis,
      datasets: []
    };
  }

  // Download each dataset
  const datasets: Dataset[] = await Promise.all(
    datasetsForViz.map((dataset: StoredDataset) => getDatasetData(dataset.name, dataset.tablename, client, options))
  );

  return {
    vis,
    datasets
  };
}

export function generateVisTableName(namespace: string, isPublic: boolean, version: number) {
  return `${namespace}_${isPublic ? 'public' : 'private'}_v${version}`;
}

export function generateDatasetTableName(tableName: string) {
  return `${tableName}_datasets`;
}

/**
 * This generates the table name for the N <-> M relationship between vis and datasets
 * @param tableName The base table name
 */
export function generateDatasetVisTableName(tableName: string) {
  return `${tableName}_datasets_vis`;
}
