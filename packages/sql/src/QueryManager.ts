import { Credentials } from './credentials';
import RequestManager from './RequestManager';

export type Pair<T> = [T, T];
export class QueryManager extends RequestManager {
  constructor(credentials: Credentials) {
    super({ ...credentials, server: credentials.server + 'api/v2/sql' });
  }

  public query(q: string, extraParams: Array<Pair<string>> = []) {
    const urlParams = [
      ['api_key', this.apiKey],
      ['q', q],
      ...extraParams
    ];

    const stringParams = encodeURI(urlParams.map(
      (param) => `${param[0]}=${param[1]}`
    ).join('&'));

    return new Promise((resolve, reject) => {
      this._scheduleRequest(
        resolve,
        reject,
        `${this.server}?${stringParams}`
      );
    });
  }
}
