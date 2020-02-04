import { Credentials } from '@carto/toolkit-core';
import RequestManager from './RequestManager';

const DEFAULT_FILENAME = 'carto_copyto.csv';
const DEFAULT_OPTIONS = 'FORMAT csv, HEADER true';

export class CopyToManager extends RequestManager {

  constructor(credentials: Credentials, options: { maxApiRequestsRetries?: number } = {}) {
    const endpointServerURL = credentials.serverURL + 'api/v2/sql/copyto';
    super(credentials, endpointServerURL, options);
  }

  public copyUrl(q: string, filename: string = DEFAULT_FILENAME, options: string = DEFAULT_OPTIONS) {
    const query = `COPY (${q}) TO stdout WITH(${options})`;
    const url = `${this.endpointServerURL}?api_key=${this.apiKey}&q=${query}&filename=${filename}`;
    return url;
  }

  /**
   * Copy a query or a table to stdout
   *
   * @param {string} q
   * @memberof CopyToManager
   */
  public copy(q: string, filename: string, options: string) {
    const url = this.copyUrl(q, filename, options);

    return new Promise((resolve, reject) => {
      this._scheduleRequest(resolve, reject, url);
    });
  }
}
