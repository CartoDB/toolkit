import { CartoError } from '@carto/toolkit-core';

/**
 * Utility to build a CartoError related to DataView errors.
 *
 * @return {CartoError} A well formed object representing the error.
 */

/**
 * CartoDataViewError types:
 * - [Error]
 * - [Missing property]
 * - [Invalid coordinate]
 *
 * @name CartoDataViewError
 * @memberof CartoError
 * @api
 */
export class CartoDataViewError extends CartoError {
  constructor(message: string, type = dataViewErrorTypes.DEFAULT) {
    super({ message, type });
    this.name = 'CartoDataViewError';
  }
}

export const dataViewErrorTypes = {
  DEFAULT: '[Error]',
  PROPERTY_MISSING: '[Missing property]',
  MAPS_API: '[Maps API]',
  PROPERTY_INVALID: '[Invalid property]'
};
