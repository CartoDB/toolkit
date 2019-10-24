import { HTTP_ERRORS } from './constants';
import { Credentials } from './credentials';

type PromiseCb<T> = (value?: T) => void;

interface FetchArgs {
  requestInfo: RequestInfo;
  requestInit: RequestInit | undefined;
  retries_no: number;
  resolve: PromiseCb<any>;
  reject: PromiseCb<Error | string>;
}

const UNKNOWN = -1;
const NO_RETRY = -1;
const MAX_RETRIES = 5;

export class RequestManager {
  private _username: string;
  private _apiKey: string;
  private _server: string;
  private _queue: FetchArgs[];
  private _callsLeft: number = UNKNOWN;
  private _retryAfter: number = UNKNOWN;
  private _retryTimeoutId: number = UNKNOWN;
  private _fetching: boolean = false;
  private _scheduleDebounce: number = UNKNOWN;

  constructor(credentials: Credentials) {
    const { username, apiKey, server } = credentials;

    this._username = username;
    this._apiKey = apiKey;
    this._server = server.replace('{user}', username);
    this._queue = [];
  }

  public setApiKey(apiKey: string) {
    this._apiKey = apiKey;
  }

  protected set callsLeft(value: number) {
    this._callsLeft = value;
  }

  protected get callsLeft() {
    return this._callsLeft;
  }

  protected _scheduleRequest(
    resolve: PromiseCb<any>,
    reject: PromiseCb<any>,
    requestInfo: RequestInfo,
    requestInit?: RequestInit) {

    this._queue.push({ resolve, reject, requestInfo, requestInit, retries_no: NO_RETRY });

    clearTimeout(this._scheduleDebounce);
    this._scheduleDebounce = window.setTimeout(() => {
      this._scheduler();
    }, 0);
  }

  private _scheduler() {
    if (this._queue.length === 0) {
      return;
    }

    if (this._retryTimeoutId !== UNKNOWN || this._fetching) {
      return;
    }

    if (this._retryAfter !== UNKNOWN) {
      this._retryTimeoutId = window.setTimeout(() => {
        this._retryTimeoutId = UNKNOWN;
        this._retryAfter = UNKNOWN;
        // Technically? But this is risky.
        this._callsLeft += 1;
        this._scheduler();
      }, this._retryAfter * 1000);

      return;
    }

    const nRequests = this._callsLeft !== -1 ?
      Math.min(
        Math.max(1, this._callsLeft),
        this._queue.length
      ) : 1;
    const promises = [];

    for (let i = 0; i < nRequests; i++) {
      this._fetching = true;

      promises.push(
        this._fetch(this._queue[i], i)
      );
    }

    Promise.all(promises).then((finishedPromises) => {
      // Filter out the promises that have finished properly
      this._queue = this._queue.filter((_e, i) => finishedPromises.indexOf(i) === -1);
      this._fetching = false;

      if (this._queue.length > 0) {
        this._scheduler();
      }
    });
  }

  private _fetch(requestDefinition: FetchArgs, index: number): Promise<number | undefined> {
    const {resolve, reject, requestInfo, requestInit, retries_no} = requestDefinition;

    return fetch(requestInfo, requestInit)
      .then(async (response) => {

        this._retryAfter = this._getRateLimitHeader(response.headers, 'Retry-After', this._retryAfter);
        this._callsLeft = this._getRateLimitHeader(response.headers, 'Carto-Rate-Limit-Remaining', this._callsLeft);

        const responseBody = await getResponseBody(response);

        const isTimeoutError = response.status === HTTP_ERRORS.TOO_MANY_REQUESTS &&
          responseBody.detail === 'datasource';

        if (response.status === HTTP_ERRORS.SERVICE_UNAVAILABLE || isTimeoutError) {
          requestDefinition.retries_no = retries_no !== NO_RETRY ? retries_no - 1 : MAX_RETRIES;

          const timeToWait = (MAX_RETRIES - requestDefinition.retries_no) * 0.5 + 0.5;
          this._retryAfter = Math.max(this._retryAfter, timeToWait);
        }

        if (requestDefinition.retries_no === 0) {
          throw new Error('Too many retries');
        }

        if (
          response.status === HTTP_ERRORS.TOO_MANY_REQUESTS ||
          response.status === HTTP_ERRORS.SERVICE_UNAVAILABLE
        ) {
          // Reschedule
          this._scheduler();
          return null;
        }

        return responseBody;
      })
      .then((data) => {
        if (data === null) {
          return;
        }

        resolve(data);

        return index;
      })
      .catch((e) => {
        reject(e);

        // Return the index because this is likely an uncontrollable error
        return index;
      });
  }

  private _getRateLimitHeader(headers: Headers, name: string, defaultValue: number): number {
    const value = headers.get(name);

    if (value !== null) {
      return parseInt(value, 10);
    }

    return defaultValue;
  }

  //#region Getters and setters

  public get username(): string {
    return this._username;
  }

  public get apiKey(): string {
    return this._apiKey;
  }

  public get server(): string {
    return this._server;
  }

  public get queued(): number {
    return this._queue.length;
  }

  //#endregion
}

export default RequestManager;

async function getResponseBody(response: Response) {
  const contentType = response.headers.get('content-type') || '';

  return contentType.includes('application/json')
    ? await response.json()
    : await response.text();
}
