import { CartoStylingError, stylingErrorTypes } from '../errors/styling-error';
import { Stats } from '../sources/Source';

export type ClassificationMethod = 'quantiles' | 'stdev' | 'equal';

export class Classifier {
  private _stats: Stats;

  constructor(stats: Stats) {
    this._stats = stats;
  }

  public breaks(nBreaks: number, method: ClassificationMethod): number[] {
    if (nBreaks === 0) {
      return [];
    }

    switch (method) {
      case 'quantiles':
        return this._quantilesBreaks(nBreaks);
      case 'equal':
        return this._equalBreaks(nBreaks);
      case 'stdev':
        return this._standarDev(nBreaks);

      default:
        throw new Error(`Unsupported classify method ${method}`);
    }
  }

  private _quantilesBreaks(nBreaks: number): number[] {
    if (!this._stats.sample) {
      throw new CartoStylingError(
        'Quantile method requires a sample in stats',
        stylingErrorTypes.CLASS_METHOD_UNSUPPORTED
      );
    }

    const sortedSample = [...this._stats.sample].sort((x, y) => x - y);

    const breaks: number[] = [];

    for (let i = 1; i <= nBreaks; i += 1) {
      const p = i / (nBreaks + 1);
      breaks.push(sortedSample[Math.floor(p * sortedSample.length) - 1]);
    }

    return breaks;
  }

  private _equalBreaks(nBreaks: number): number[] {
    const { min, max } = this._stats;

    if (min === undefined || max === undefined) {
      throw new CartoStylingError(
        'Equal breaks requires max and min in stats',
        stylingErrorTypes.CLASS_METHOD_UNSUPPORTED
      );
    }

    const breaks: number[] = [];

    for (let i = 1; i <= nBreaks; i += 1) {
      const p = i / (nBreaks + 1);
      breaks.push(min + (max - min) * p);
    }

    return breaks;
  }

  private _standarDev(nBreaks: number, classSize = 1.0): number[] {
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
    const isEven = (nBreaks + 1) % 2 === 0;
    let factor = isEven ? 0.0 : 1.0; // if odd, central class is double sized

    do {
      const step = factor * (stdev * classSize);
      over.push(avg + step);
      under.push(avg - step);
      breaks = [...new Set(over.concat(under))];
      breaks.sort((a, b) => a - b);
      factor += 1;
    } while (breaks.length < nBreaks);

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
