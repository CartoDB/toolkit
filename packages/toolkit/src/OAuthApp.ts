import { OAuth } from '@carto/toolkit-auth';
import { AuthParameters } from '@carto/toolkit-auth/dist/types/AuthParameters';
import App, { AppOptions, AuthRequiredProps, DEFAULT_OPTIONS } from './App';

export default class OAuthApp extends App {
  private _oauth: OAuth | null = null;
  private _oauthOptions: AuthParameters;

  constructor(oauthOptions: AuthParameters, options: AppOptions = DEFAULT_OPTIONS) {
    super(options);
    this._oauthOptions = oauthOptions;

    if (oauthOptions.clientID) {
      this.initOauth(oauthOptions);
    }
  }

  /**
   * This function will start the OAuth flow, and will inherently call setCredentials.
   */
  public async login() {
    const oauth = this.oauth;

    let token = oauth.token;

    if (oauth.expired) {
      try {
        await oauth.login();
      } catch (e) {
        throw new Error(`Failed to login (${e.error}): ${e.message}`);
      }

      token = oauth.token;
    }

    if (token === null) {
      throw new Error(`Failed to login, token is null`);
    }

    return this.postLogin(oauth, token);
  }

  public get oauth(): OAuth {
    if (this._oauth === null) {
      throw new Error('No client ID has been specified');
    }

    return this._oauth;
  }

  public setClientID(clientID: string) {
    if (this._oauth) {
      throw new Error('Cannot set the client ID more than once');
    }

    if (clientID === undefined) {
      return;
    }

    this.initOauth({
      clientID,
      ...this._oauthOptions
    });
  }

  private initOauth(params: AuthParameters) {
    this._oauth = new OAuth(params);

    if (!this._oauth.expired) {
      this.login();
    }
  }

  private async postLogin(oauth: OAuth, token: string): Promise<AuthRequiredProps> {
    const userInfo = oauth.userInfo;

    if (userInfo === null) {
      throw new Error(`Failed to get user info`);
    }

    const info = await userInfo.info;

    this.setupEvents(oauth);

    return this.setCredentials(token, info.username);
  }

  private setupEvents(oauth: OAuth) {
    oauth.on('tokenUpdated', () => {
      if (oauth.token === null) {
        throw new Error('Got a null token after refreshing it');
      }

      this.setApiKey(oauth.token);
    });
  }
}
