import { Credentials, MetricsEvent } from '@carto/toolkit-core';
import RequestManager from './RequestManager';

export class CopyFromManager extends RequestManager {

  constructor(credentials: Credentials, options: { maxApiRequestsRetries?: number } = {}) {
    const endpointServerURL = credentials.serverURL + 'api/v2/sql/copyfrom';
    super(credentials, endpointServerURL, options);
  }

  public copy(csv: string, tableName: string, fields: string[], options: { event?: MetricsEvent } = {}) {
    const query = `COPY ${tableName} (${fields}) FROM STDIN WITH (FORMAT csv, HEADER true);`;
    const url = `${this.endpointServerURL}?api_key=${this.apiKey}&q=${query}`;
    const file = new Blob([csv]);

    const requestInit = {
      method: 'POST',
      body: file,
    };

    const customHeaders = options.event ? options.event.getHeaders() : [];
    this.addHeadersTo(requestInit, customHeaders);

    return new Promise((resolve, reject) => {
      this._scheduleRequest(resolve, reject, url, requestInit);
    });
  }
}
