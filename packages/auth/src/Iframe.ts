import { Utils } from '@salte-auth/salte-auth';
import { AuthParameters } from './AuthParameters';
import { CARTO_AUTHORIZATION_BASE } from './constants';
import { buildParams, Pair } from './utils';

export class Iframe {
  private _params: AuthParameters;

  constructor(args: AuthParameters) {
    this._params = args;
  }

  public refresh(state: string): Promise<any> {
    const params = [
      ['client_id', this._params.clientID],
      ['response_type', 'token'],
      ['prompt', 'none'],
      ['scopes', this._params.scopes],
      ['state', state]
    ];

    if (this._params.redirectURI) {
      params.push(['redirect_uri', this._params.redirectURI]);
    }

    const url = `${CARTO_AUTHORIZATION_BASE}/authorize?${buildParams(params as Array<Pair<string>>)}`;

    return Utils.Common.iframe({
      url,
      redirectUrl: this._params.redirectURI || window.location.href,
      visible: false
    });
  }
}
