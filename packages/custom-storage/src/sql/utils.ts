import { SQL } from '@carto/toolkit-sql';
import { CompleteVisualization, Dataset, StoredDataset, StoredVisualization } from '../StorageRepository';

export function rowToVisualization(row: any): StoredVisualization {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    thumbnail: row.thumbnail,
    isPrivate: row.private,
    config: row.config,
    lastModified: row.last_modified
  };
}

export async function getDatasetData(name: string, client: SQL): Promise<Dataset> {
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

export async function getDatasetsForVis(
  datasetsTableName: string,
  datasetsVisTableName: string,
  visId: string,
  client: SQL): Promise<StoredDataset[]> {
  const datasetsResp: any = await (client).query(`
    WITH datasets AS (SELECT dataset FROM ${datasetsVisTableName} WHERE vis = '${visId}')
    SELECT t.id, t.name, t.tablename FROM ${datasetsTableName} t, datasets u
    WHERE t.id = u.dataset
  `);

  if (datasetsResp.error) {
    throw new Error(datasetsResp.error);
  }

  return datasetsResp.rows;
}


export async function getVisualization(
  tableName: string,
  datasetsTableName: string,
  datasetsVisTableName: string,
  id: string,
  client: SQL): Promise<CompleteVisualization | null> {
  const response: any = await client.query(`SELECT * FROM ${tableName} WHERE id = '${id}'`);

  if (response.error) {
    throw new Error(response.error);
  }

  if (response.rows.length === 0) {
    return null;
  }

  const vis = rowToVisualization(response.rows[0]);

  const datasetsForViz = await getDatasetsForVis(datasetsTableName, datasetsVisTableName, id, client);

  if (datasetsForViz.length === 0) {
    return {
      vis,
      datasets: []
    };
  }

  // Download each dataset
  const datasets: Dataset[] = await Promise.all(
    datasetsForViz.map((dataset: StoredDataset) => getDatasetData(dataset.tablename, client))
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
