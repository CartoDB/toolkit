
import { uuidv4 } from './utils';

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
      ['carto-source-lib', this.lib],
      ['carto-source-context', this.context],
      ['carto-source-context-id', this.contextId],
    ];
  }
}

export default MetricsEvent;
