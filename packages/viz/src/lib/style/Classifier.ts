/**
 * Metadata interface retrieved from the
 * Map API instantiation.
 */

import { FieldStats } from '../sources/Source';

export type ClassificationMethod = 'quantiles' | 'stdev' | 'equal';

export class Classifier {
  private _stats: FieldStats;

  constructor(stats: FieldStats) {
    this._stats = stats;
  }

  public classify(nBuckets: number, method: ClassificationMethod): number[] {
    switch (method) {
      case 'quantiles':
        return this._quantilesBuckets(nBuckets);
      case 'equal':
        return this._equalBuckets(nBuckets);
      default:
        throw new Error(`Unsupported classify method ${method}`);
    }
  }

  private _quantilesBuckets(nBuckets: number): number[] {
    const sortedSample = [...this._stats.sample].sort((x, y) => x - y);

    const buckets: number[] = [];

    for (let i = 1; i <= nBuckets; i += 1) {
      const p = i / nBuckets;
      buckets.push(sortedSample[Math.floor(p * sortedSample.length)]);
    }

    return buckets;
  }

  private _equalBuckets(nBuckets: number): number[] {
    const { min, max } = this._stats;
    const buckets: number[] = [];

    for (let i = 1; i <= nBuckets; i += 1) {
      const p = i / nBuckets;
      buckets.push(min + (max - min) * p);
    }

    return buckets;
  }
}
