import { CartoError } from '@carto/toolkit-core';

/**
 * Utility to build a CartoError related to Styling errors.
 *
 * @return {CartoError} A well formed object representing the error.
 */

/**
 * CartoStylingError types:
 * - [Error]
 * - [Missing property]
 *
 * @name CartoStylingError
 * @memberof CartoError
 * @api
 */
export class CartoStylingError extends CartoError {
  constructor(message: string, type = stylingErrorTypes.DEFAULT) {
    super({ message, type });
    this.name = 'CartoStylingError';
  }
}

export const stylingErrorTypes = {
  DEFAULT: '[Error]',
  PROPERTY_MISSING: '[Missing property]',
  PROPERTY_MISMATCH: '[Property mismatching]',
  PALETTE_NOT_FOUND: '[Palette not found]',
  CLASS_METHOD_UNSUPPORTED: '[Classification method not supported]',
  SOURCE_INSTANCE_MISSING: '[Source instance missing]',
  OPTIONS_MISSING: '[Options missing]',
  GEOMETRY_TYPE_UNSUPPORTED: '[GeometryType not supported]'
};
