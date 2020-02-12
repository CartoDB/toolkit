
import { uuidv4 } from './utils';

// Custom CARTO headers, for metrics at API level
// Double check they are valid for the API (eg. allowed for CORS requests)
const CUSTOM_HEADER_LIB = 'Carto-Source-Lib';
const CUSTOM_HEADER_CONTEXT = 'Carto-Source-Context';
const CUSTOM_HEADER_CONTEXT_ID = 'Carto-Source-Context-Id';

/**
 * Class to represent a relevant event, identifying several properties
 * of its source: lib, context and contextId
 */
class MetricsEvent {
  public lib: string;
  public context: string;
  public contextId: string;

  constructor(lib: string, context: string, contextId: string = uuidv4()) {
    this.lib = lib;
    this.context = context;
    this.contextId = contextId;
  }

  public getHeaders() {
    return [
      [CUSTOM_HEADER_LIB, this.lib],
      [CUSTOM_HEADER_CONTEXT, this.context],
      [CUSTOM_HEADER_CONTEXT_ID, this.contextId],
    ];
  }
}

export default MetricsEvent;
