import { CartoError } from '@carto/toolkit-core';

/**
 * Utility to build a CartoError related to Basemap helpers
 *
 * @return {CartoError} A well formed object representing the error.
 */

/**
 * CartoBaseMapError types:
 * - [Error]
 *
 * @name CartoBaseMapError
 * @memberof CartoError
 * @api
 */
export class CartoBaseMapError extends CartoError {
  constructor(message: string, type = basemapErrorTypes.DEFAULT) {
    super({ message, type });
    this.name = 'CartoBaseMapError';
  }
}

export const basemapErrorTypes = {
  DEFAULT: '[Error]'
};
