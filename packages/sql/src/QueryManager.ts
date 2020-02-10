import { Credentials } from '@carto/toolkit-core';
import { QUERY_LIMIT } from './constants';
import RequestManager from './RequestManager';

export type Pair<T> = [T, T];
export class QueryManager extends RequestManager {

  constructor(credentials: Credentials, options: { maxApiRequestsRetries?: number } = {}) {
    const endpointServerURL = credentials.serverURL + 'api/v2/sql';
    super(credentials, endpointServerURL, options);
  }

  public query(q: string, extraParams: Array<Pair<string>> = []) {
    const urlParams = [
      ['api_key', this.apiKey],
      ['q', q],
      ...extraParams
    ];

    if (q.length < QUERY_LIMIT) {
      return this.prepareGetRequest(urlParams);
    } else {
      return this.preparePostRequest(urlParams);
    }
  }

  private prepareGetRequest(urlParams: string[][]) {
    const stringParams = encodeURI(urlParams.map(
      (param) => `${param[0]}=${param[1]}`
    ).join('&'));

    const requestInit = {
      method: 'GET'
    };

    return new Promise((resolve, reject) => {
      this._scheduleRequest(
        resolve,
        reject,
        `${this.endpointServerURL}?${stringParams}`,
        requestInit
      );
    });
  }

  private preparePostRequest(urlParams: string[][]) {
    const formData = new FormData();

    urlParams.forEach((value) => formData.set(value[0], value[1]));

    const requestInit = {
      method: 'POST',
      body: formData
    };

    return new Promise((resolve, reject) => {
      this._scheduleRequest(
        resolve,
        reject,
        `${this.endpointServerURL}`,
        requestInit
      );
    });
  }
}
