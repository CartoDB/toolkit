import { Credentials } from '@carto/toolkit-core';
import { Popup } from '@salte-auth/popup';
import { SalteAuth } from '@salte-auth/salte-auth';
import mitt from 'mitt';
import { AuthParameters } from './AuthParameters';
import CartoProvider from './CartoProvider';
import { CARTO_AUTHORIZATION_BASE, NO_TIMEOUT, REFRESH_STATE_PREFIX, THRESHOLD } from './constants';
import { Iframe } from './Iframe';
import UserInfo from './UserInfo';
import { unknownScopes } from './utils';

class OAuth {
  private _client: SalteAuth;
  private _carto: CartoProvider;
  private _refresher: Iframe;
  private _refreshTimeout: number = NO_TIMEOUT;
  private _emitter: mitt.Emitter;

  constructor(args: AuthParameters, refreshUrl?: string) {
    if (args == null) {
      throw new Error('Missing OAuth parameters');
    }

    args.authorization = args.authorization || CARTO_AUTHORIZATION_BASE;
    args.scopes = args.scopes || '';

    this._emitter = mitt();

    this._client = new SalteAuth({
      providers: [
        new CartoProvider({
          storage: 'local',
          level: 'trace',
          url: args.authorization,
          redirectUrl: args.redirectURI,
          clientID: args.clientID,
          responseType: 'token',
          scope: args.scopes
        })
      ],

      handlers: [
        new Popup({
          default: true
        })
      ]
    });

    this._refresher = new Iframe({
      authorization: args.authorization,
      redirectURI: refreshUrl || args.redirectURI,
      clientID: args.clientID,
      scopes: args.scopes
    });

    // Read the expires_in, setup timer
    this._carto = this._client.provider('carto') as CartoProvider;

    if (!this._carto.expired) {
      this._scheduleRefresh();
    }

    if (args.scopes) {
      this._checkScopes(args.scopes);
    }
  }

  public login() {
    return new Promise((resolve, reject) => {
      const cb = (error?: any, token?: SalteAuth.EventWrapper) => {

        if (error) {
          const parsedError = {
            error: error.code,
            message: decodeURIComponent(error.message.replace(/\+/g, '%20'))
          };

          reject(parsedError);
          this._emitter.emit('error', parsedError);
          return;
        }

        resolve(token);
        this._emitter.emit('tokenUpdated', token);
        this._carto.off('login', cb);

        this._scheduleRefresh();
      };

      this._client.on('login', cb);
      this._client.login('carto').catch((err) => {
        reject(err);
      });
    });
  }

  public get client() {
    return this._client;
  }

  public get expired() {
    return this._carto.accessToken && this._carto.accessToken.expired;
  }

  public get credentials() {
    if (!this._carto.accessToken) {
      return null;
    }

    return new Credentials(this._carto.userInfo, this._carto.accessToken.raw);
  }

  public get token() {
    if (this._carto.accessToken == null) {
      return null;
    }

    return this._carto.accessToken.raw;
  }

  public get userInfo() {
    if (this.token === null) {
      return null;
    }

    return new UserInfo(this.token, this._carto.userInfo);
  }

  public clear() {
    this._carto.reset();
  }

  public on(type: string, handler: mitt.Handler) {
    this._emitter.on(type, handler);
  }

  private _scheduleRefresh() {
    clearTimeout(this._refreshTimeout);
    this._refreshTimeout = window.setTimeout(() => {
      this._refresh();
    }, this._carto.expiresIn - Date.now() - THRESHOLD);
  }

  private _refresh() {
    if (this._carto.expired) {
      return;
    }

    const time = Date.now();
    this._carto.set('state', `${REFRESH_STATE_PREFIX}-${time}`);
    this._refresher.refresh(`${REFRESH_STATE_PREFIX}-${time}`).then((data) => {
      if (data.error) {
        this._emitter.emit('error', {
          error: data.error,
          message: data.error_description.replace(/\+/g, ' ')
        });
        return;
      }

      this._carto.validate(data);

      this._emitter.emit('tokenUpdated', data.access_token);
    }).catch((error) => {
      this._emitter.emit('error', error);
    });
  }

  private _checkScopes(scopes: string) {
    const warnScopes = new Set<string>();
    const scopesList = scopes.split(' ');

    if (scopes) {
      unknownScopes(scopesList || []).forEach((scope) => warnScopes.add(scope));
    }

    warnScopes.forEach((scope) => {
      // tslint:disable-next-line: no-console
      console.warn(`Unknown scope ${scope}`);
    });
  }
}

export default OAuth;
