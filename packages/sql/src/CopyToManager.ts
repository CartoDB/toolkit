import { Credentials } from './credentials';
import RequestManager from './RequestManager';

const DEFAULT_FILENAME = 'carto_copyto.csv';
const DEFAULT_OPTIONS = 'FORMAT csv, HEADER true';

export class CopyToManager extends RequestManager {

  constructor(credentials: Credentials) {
    super({ ...credentials, server: credentials.server + 'api/v2/sql/copyto' });
  }

  public query(q: string) {
    return new Promise((resolve, reject) => {
      this._scheduleRequest(resolve, reject, `${this.server}?api_key=${this.apiKey}&q=${q}`);
    });
  }

  public copyUrl(q: string, filename: string = DEFAULT_FILENAME, options: string = DEFAULT_OPTIONS) {
    const query = `COPY (${q}) TO stdout WITH(${options})`;

    const url = `${this.server}?api_key=${this.apiKey}&q=${query}&filename=${filename}`;

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
