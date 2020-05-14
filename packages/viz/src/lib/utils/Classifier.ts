import { CartoStylingError, stylingErrorTypes } from '../errors/styling-error';

export type ClassificationMethod = 'quantiles' | 'stdev' | 'equal';

export interface Stats {
  min: number;
  max: number;
  avg?: number;
  sum?: number;
  sample?: number[];
  stdev?: number;
  range?: number;
}

export class Classifier {
  private _stats: Stats;

  constructor(stats: Stats) {
    this._stats = stats;
  }

  public breaks(nBuckets: number, method: ClassificationMethod): number[] {
    if (nBuckets === 1) {
      return [];
    }

    switch (method) {
      case 'quantiles':
        return this._quantilesBreaks(nBuckets);
      case 'equal':
        return this._equalBreaks(nBuckets);
      case 'stdev':
        return this._standarDev(nBuckets);

      default:
        throw new Error(`Unsupported classify method ${method}`);
    }
  }

  private _quantilesBreaks(nBuckets: number): number[] {
    if (!this._stats.sample) {
      throw new CartoStylingError(
        'Quantile method requires a sample in stats',
        stylingErrorTypes.CLASS_METHOD_UNSUPPORTED
      );
    }

    const sortedSample = [...this._stats.sample].sort((x, y) => x - y);

    const breaks: number[] = [];

    for (let i = 1; i <= nBuckets - 1; i += 1) {
      const p = i / nBuckets;
      breaks.push(sortedSample[Math.floor(p * sortedSample.length) - 1]);
    }

    return breaks;
  }

  private _equalBreaks(nBuckets: number): number[] {
    const { min, max } = this._stats;

    if (min === undefined || max === undefined) {
      throw new CartoStylingError(
        'Equal breaks requires max and min in stats',
        stylingErrorTypes.CLASS_METHOD_UNSUPPORTED
      );
    }

    const breaks: number[] = [];

    for (let i = 1; i <= nBuckets - 1; i += 1) {
      const p = i / nBuckets;
      breaks.push(min + (max - min) * p);
    }

    return breaks;
  }

  private _standarDev(nBuckets: number, classSize = 1.0): number[] {
    const { avg, sample } = this._stats;
    let { stdev } = this._stats;

    if (avg === undefined) {
      throw new CartoStylingError(
        'Standard dev requires avg in stats',
        stylingErrorTypes.CLASS_METHOD_UNSUPPORTED
      );
    }

    if (stdev === undefined) {
      if (!sample) {
        throw new CartoStylingError(
          'Standard dev requires samples in stats',
          stylingErrorTypes.CLASS_METHOD_UNSUPPORTED
        );
      }

      stdev = standardDeviation(sample, avg);
    }

    let breaks;
    const over = [];
    const under = [];
    const isEven = nBuckets % 2 === 0;
    let factor = isEven ? 0.0 : 1.0; // if odd, central class is double sized

    do {
      const step = factor * (stdev * classSize);
      over.push(avg + step);
      under.push(avg - step);
      breaks = [...new Set(over.concat(under))];
      breaks.sort((a, b) => a - b);
      factor += 1;
    } while (breaks.length < nBuckets - 1);

    return breaks;
  }
}

/**
 * Calculate Variance
 */
function variance(values: number[], avg: number): number[] {
  const variances = [];

  for (let i = 0; i < values.length; i += 1) {
    const diff = values[i] - avg;
    variances.push(diff * diff);
  }

  return variances;
}

/**
 * Calculate Standard Deviation (STD), using population deviation formula
 *
 * @param {Number[]} values
 * @returns {Number} - standard deviation
 */
function standardDeviation(values: number[], avg: number): number {
  const avgVariance = average(variance(values, avg));
  return Math.sqrt(avgVariance);
}

/**
 * Calculate Average
 */
function average(values: number[]): number {
  let sum = 0;

  for (let i = 0; i < values.length; i += 1) {
    sum += values[i];
  }

  return sum / values.length;
}
