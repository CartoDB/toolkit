import { Credentials } from '@carto/toolkit-core';
import { QUERY_LIMIT } from './constants';
import RequestManager from './RequestManager';

export type Pair<T> = [T, T];
export class QueryManager extends RequestManager {

  constructor(credentials: Credentials, options: { maxApiRequestsRetries?: number } = {}) {
    const endpointServerURL = credentials.serverURL + 'api/v2/sql';
    super(credentials, endpointServerURL, options);
  }

  public query(q: string, extraParams: Array<Pair<string>> = [], headers: Array<Pair<string>> = []) {
    const urlParams = [
      ['api_key', this.apiKey],
      ['q', q],
      ...extraParams
    ];

    if (q.length < QUERY_LIMIT) {
      return this.prepareGetRequest(urlParams, headers);
    } else {
      return this.preparePostRequest(urlParams, headers);
    }
  }

  private prepareGetRequest(urlParams: string[][], customHeaders: Array<Pair<string>> = []) {
    const stringParams = encodeURI(urlParams.map(
      (param) => `${param[0]}=${param[1]}`
    ).join('&'));

    const requestInit = {
      method: 'GET',
      headers: new Headers()
    };

    if (customHeaders.length > 0) {
      customHeaders.forEach((header) => {
        requestInit.headers.append(header[0], header[1]);
      });
    }

    return new Promise((resolve, reject) => {
      this._scheduleRequest(
        resolve,
        reject,
        `${this.endpointServerURL}?${stringParams}`,
        requestInit
      );
    });
  }

  private preparePostRequest(urlParams: string[][], customHeaders: Array<Pair<string>> = []) {
    const formData = new FormData();

    urlParams.forEach((value) => formData.set(value[0], value[1]));

    const requestInit = {
      method: 'POST',
      body: formData,
      headers: new Headers()
    };

    if (customHeaders.length > 0) {
      customHeaders.forEach((header) => {
        requestInit.headers.append(header[0], header[1]);
      });
    }

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
