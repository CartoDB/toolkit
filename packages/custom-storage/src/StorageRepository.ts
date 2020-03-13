import { ColumConfig } from '@carto/toolkit-sql/dist/types/DDL';

export interface StoredDataset {
  id: string;
  name: string;
  tablename: string;
}
export interface StoredVisualization extends Visualization {
  id: string;
}

export interface CompleteVisualization {
  vis: StoredVisualization;
  datasets: Dataset[];
}

export interface Visualization {
  name: string;
  description: string;
  thumbnail: string;
  isprivate: boolean;
  config: string;
  lastmodified: string;
}

export interface Dataset {
  name: string;
  columns?: Array<string | ColumConfig>;
  file: string;
}

export interface StorageRepository {
  getVisualizations(): Promise<StoredVisualization[]>;
  getPublicVisualizations(): Promise<StoredVisualization[]>;
  getPrivateVisualizations(): Promise<StoredVisualization[]>;
  getVisualization(id: string): Promise<CompleteVisualization | null>;
  getDatasets(): Promise<StoredDataset[]>;
  getVisForDataset(dataset: string): Promise<StoredVisualization[]>;
  deleteVisualization(id: string): Promise<boolean>;
  createVisualization(
    visualization: Visualization,
    datasets: Array<Dataset | string>,
    overwrite: boolean): Promise<StoredVisualization | null>;
  updateVisualization(visualization: StoredVisualization, datasets: Dataset[]): Promise<any>;
  uploadPublicDataset(dataset: Dataset): Promise<StoredDataset>;
  uploadPrivateDataset(dataset: Dataset): Promise<StoredDataset>;
  getVersion(): number;
  migrate(): Promise<void>;
}
