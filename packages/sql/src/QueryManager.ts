import { Credentials, MetricsEvent } from '@carto/toolkit-core';
import { QUERY_LIMIT } from './constants';
import { RequestManager } from './RequestManager';

export type Pair<T> = [T, T];
export class QueryManager extends RequestManager {
  constructor(
    credentials: Credentials,
    options: { maxApiRequestsRetries?: number } = {}
  ) {
    const endpointServerURL = `${credentials.serverURL}api/v2/sql`;
    super(credentials, endpointServerURL, options);
  }

  public query(
    q: string,
    options: {
      extraParams?: Array<Pair<string>>;
      event?: MetricsEvent;
    } = {}
  ) {
    const urlParams = [
      ['api_key', this.apiKey],
      ['q', q]
    ];

    if (options.extraParams) {
      urlParams.push(...options.extraParams);
    }

    const customHeaders = options.event ? options.event.getHeaders() : [];

    if (q.length < QUERY_LIMIT) {
      return this.prepareGetRequest(urlParams, customHeaders);
    }

    return this.preparePostRequest(urlParams, customHeaders);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, class-methods-use-this
  protected addHeadersTo(requestInit: any, headers: string[][] = []) {
    if (requestInit === undefined) {
      return;
    }

    if (!requestInit.headers) {
      // eslint-disable-next-line no-param-reassign
      requestInit.headers = new Headers();
    }

    if (headers.length > 0) {
      headers.forEach(header => {
        requestInit.headers.append(header[0], header[1]);
      });
    }
  }

  private prepareGetRequest(
    urlParams: string[][],
    customHeaders: string[][] = []
  ) {
    const stringParams = encodeURI(
      urlParams.map(param => `${param[0]}=${param[1]}`).join('&')
    );

    const requestInit = {
      method: 'GET'
    };
    this.addHeadersTo(requestInit, customHeaders);

    return new Promise((resolve, reject) => {
      this._scheduleRequest(
        resolve,
        reject,
        `${this.endpointServerURL}?${stringParams}`,
        requestInit
      );
    });
  }

  private preparePostRequest(
    urlParams: string[][],
    customHeaders: string[][] = []
  ) {
    const formData = new FormData();

    urlParams.forEach(value => formData.set(value[0], value[1]));

    const requestInit = {
      method: 'POST',
      body: formData
    };
    this.addHeadersTo(requestInit, customHeaders);

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
