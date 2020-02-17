
import { uuidv4 } from './utils';

// Custom CARTO headers, for metrics at API level
// Double check they are valid for the API (eg. allowed for CORS requests)
const CUSTOM_HEADER_EVENT_SOURCE = 'Carto-Event-Source';
const CUSTOM_HEADER_EVENT = 'Carto-Event';
const CUSTOM_HEADER_EVENT_GROUP_ID = 'Carto-Event-Group-Id';

/**
 * Class to represent a relevant event, identifying several relevant properties
 * of it: source, name and group-id
 */
class MetricsEvent {
  public source: string;
  public name: string;
  public groupId: string;

  constructor(source: string, name: string, groupId: string = uuidv4()) {
    this.source = source;
    this.name = name;
    this.groupId = groupId;
  }

  public getHeaders() {
    return [
      [CUSTOM_HEADER_EVENT_SOURCE, this.source],
      [CUSTOM_HEADER_EVENT, this.name],
      [CUSTOM_HEADER_EVENT_GROUP_ID, this.groupId],
    ];
  }
}

export default MetricsEvent;
