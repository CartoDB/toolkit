import { CustomStorageError } from './CustomStorageError';
import { DUPLICATED_DATASETS } from './ErrorCodes';

export class DuplicatedDatasetsError extends CustomStorageError {
  public datasets: string[];

  constructor(datasets: string[]) {
    super(DUPLICATED_DATASETS, 'Some datasets are duplicated');

    this.datasets = datasets;
  }
}
