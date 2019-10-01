import { Credentials } from './credentials';
import RequestManager from './RequestManager';

export class CopyFromManager extends RequestManager {

  constructor(credentials: Credentials) {
    super({ ...credentials, server: credentials.server + 'api/v2/sql/copyfrom' });
  }

  public copy(csv: string, tableName: string, fields: string[]) {
    const query = `COPY ${tableName} (${fields}) FROM STDIN WITH (FORMAT csv, HEADER true);`;
    const url = `${this.server}?api_key=${this.apiKey}&q=${query}`;
    const file = new Blob([csv]);

    return new Promise((resolve, reject) => {
      this._scheduleRequest(resolve, reject, url, {
        body: file,
        method: 'POST'
      });
    });
  }
}
