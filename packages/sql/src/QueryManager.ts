import { Credentials } from './credentials';
import RequestManager from './RequestManager';

export class QueryManager extends RequestManager {
  constructor(credentials: Credentials) {
    super({ ...credentials, server: credentials.server + 'api/v2/sql' });
  }

  public query(q: string) {
    return new Promise((resolve, reject) => {
      this._scheduleRequest(
        resolve,
        reject,
        `${this.server}?api_key=${this.apiKey}&q=${q}`
      );
    });
  }
}
