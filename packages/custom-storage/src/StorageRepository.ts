import { ColumConfig } from '@carto/toolkit-sql/dist/types/DDL';

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
  isPrivate: boolean;
  config: string;
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
  getPublicVisualization(id: string): Promise<CompleteVisualization | null>;
  deleteVisualization(id: string): Promise<boolean>;
  createVisualization(
    visualization: Visualization,
    datasets: Dataset[],
    overwrite: boolean): Promise<StoredVisualization | null>;
  updateVisualization(visualization: StoredVisualization, datasets: Dataset[]): Promise<any>;
  getVersion(): number;
  migrate(): Promise<void>;
}
