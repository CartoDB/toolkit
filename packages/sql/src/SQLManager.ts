import RequestManager from './RequestManager';

export class SQLManager extends RequestManager {

  public query(q: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._scheduleRequest(resolve, reject, `${this.server}?api_key=${this.apiKey}&q=${q}`);
    });
  }
}
