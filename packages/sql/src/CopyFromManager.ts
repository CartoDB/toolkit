import { Credentials } from '@carto/toolkit-core';
import RequestManager from './RequestManager';

export class CopyFromManager extends RequestManager {

  constructor(credentials: Credentials, options: { maxApiRequestsRetries?: number } = {}) {
    const endpointServerURL = credentials.serverURL + 'api/v2/sql/copyfrom';
    super(credentials, endpointServerURL, options);
  }

  public copy(csv: string, tableName: string, fields: string[]) {
    const query = `COPY ${tableName} (${fields}) FROM STDIN WITH (FORMAT csv, HEADER true);`;
    const url = `${this.endpointServerURL}?api_key=${this.apiKey}&q=${query}`;
    const file = new Blob([csv]);

    return new Promise((resolve, reject) => {
      this._scheduleRequest(resolve, reject, url, {
        body: file,
        method: 'POST'
      });
    });
  }
}
