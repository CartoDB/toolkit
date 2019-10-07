import { SQL } from '@carto/toolkit-sql';
import { CompleteVisualization, Dataset, StoredVisualization } from '../StorageRepository';

export function rowToVisualization(row: any): StoredVisualization {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    thumbnail: row.thumbnail,
    isPrivate: row.private,
    config: row.config
  };
}

export async function getDataset(name: string, client: SQL): Promise<Dataset> {
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
  tableName: string,
  visId: string,
  client: SQL): Promise<string[]> {
  const datasetsResp: any = await (client).query(`SELECT * FROM ${tableName} WHERE vis = '${visId}'`);

  if (datasetsResp.error) {
    throw new Error(datasetsResp.error);
  }

  return datasetsResp.rows.map((row: any) => row.name);
}


export async function getVisualization(
  tableName: string,
  datasetsTableName: string,
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

  const datasetsForViz = await getDatasetsForVis(datasetsTableName, id, client);

  if (datasetsForViz.length === 0) {
    return {
      vis,
      datasets: []
    };
  }

  // Download each dataset
  const datasets: Dataset[] = await Promise.all(
    datasetsForViz.map((dataset: any) => getDataset(dataset, client))
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
