import { CartoError } from '@carto/toolkit-core';

/**
 * Utility to build a CartoError related to Source errors.
 *
 * @return {CartoError} A well formed object representing the error.
 */

/**
 * CartoSourceError types:
 * - [Error]
 * - [Missing property]
 *
 * @name SourceError
 * @memberof CartoError
 * @api
 */
export class SourceError extends CartoError {
  constructor(message: string, type = sourceErrorTypes.DEFAULT) {
    super({ message, type });
    this.name = 'SourceError';
  }
}

export const sourceErrorTypes = {
  DEFAULT: '[Error]',
  INIT_SKIPPED: '[To run this method you need to first call to init()]',
  UNSUPPORTED_STATS_TYPE:
    '[Stats are only supported for number and string fields]'
};
