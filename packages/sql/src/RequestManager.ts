import { Credentials } from './credentials';

type PromiseCb<T> = (value?: T) => void;
type FetchArgs = [PromiseCb<any>, PromiseCb<any>, RequestInfo, RequestInit?];

export class RequestManager {
  private _username: string;
  private _apiKey: string;
  private _server: string;
  private _queue: FetchArgs[];
  private _callsLeft: number = -1;
  private _totalCalls: number = -1;
  private _bufferTime: number = -1;

  constructor(credentials: Credentials) {
    const { username, apiKey, server } = credentials;

    this._username = username;
    this._apiKey = apiKey;
    this._server = server.replace('{user}', username);
    this._queue = [];
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
    info: RequestInfo,
    init?: RequestInit) {

    this._queue.push([resolve, reject, info, init]);

    this._scheduler();
  }

  private _scheduler() {
    if (this._queue.length === 0) {
      return;
    }

    // We don't know the limits yet
    if (this._callsLeft === -1) {
      const [resolve, reject, info, init] = this._queue[0];

      fetch(info, init)
        .then((response) => {
          const cache = response.headers.get('X-Cache');

          if (cache === null) {
            this._totalCalls = Number(response.headers.get('Carto-Rate-Limit-Limit'));
            this._callsLeft = Number(response.headers.get('Carto-Rate-Limit-Remaining'));
          }

          return response.json();
        })
        .then((json) => resolve(json))
        .catch((e) => reject(e));

      this._scheduler();
      return;
    }
  }

  //#region Getters

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
