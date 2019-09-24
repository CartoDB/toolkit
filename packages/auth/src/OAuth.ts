import { Popup } from '@salte-auth/popup';
import { SalteAuth } from '@salte-auth/salte-auth';
import mitt from 'mitt';
import { AuthParameters } from './AuthParameters';
import CartoProvider from './CartoProvider';
import { CARTO_AUTHORIZATION_BASE, THRESHOLD } from './constants';
import Credentials from './Credentials';
import { Iframe } from './Iframe';
import UserInfo from './UserInfo';
import { unknownScopes } from './utils';

class OAuth {
  private _client: SalteAuth;
  private _carto: CartoProvider;
  private _refresher: Iframe;
  private _refreshTimeout: number = -1;
  private _emitter: mitt.Emitter;

  constructor(args: AuthParameters, refreshUrl: string | undefined) {
    if (args == null) {
      throw new Error('Missing OAuth parameters');
    }

    args.authorization = args.authorization || CARTO_AUTHORIZATION_BASE;
    args.scopes = args.scopes || '';

    this._emitter = new mitt();

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

    if (this._carto.expiresIn !== -1) {
      this._scheduleRefresh();
    }

    if (args.scopes) {
      this._checkScopes(args.scopes);
    }
  }

  public login() {
    return new Promise((resolve, reject) => {
      const cb = (error?: Error, token?: SalteAuth.EventWrapper) => {

        if (error) {
          reject(error);
          this._emitter.emit('error');
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

    return new Credentials('roman-carto', this._carto.accessToken.raw);
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
    this._refresher.refresh().then((data) => {
      // This is nasty, using salte-auth 'internals'
      this._carto.set('access-token.raw', data.access_token);
      this._carto.set('access-token.expiration', Date.now() + (Number(data.expires_in) * 1000));
      this._carto.sync();

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
