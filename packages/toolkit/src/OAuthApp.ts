import { OAuth } from '@carto/toolkit-auth';
import { AuthParameters } from '@carto/toolkit-auth/dist/types/AuthParameters';
import App, { AppOptions, DEFAULT_OPTIONS } from './App';

export default class OAuthApp extends App {
  private _oauth: OAuth;

  constructor(oauthOptions: AuthParameters, options: AppOptions = DEFAULT_OPTIONS) {
    super(options);

    this._oauth = new OAuth(oauthOptions);
  }

  /**
   * This function will start the OAuth flow, and will inherently call setCredentials.
   */
  public async login() {
    let token = this._oauth.token;

    if (this._oauth.expired) {
      try {
        await this._oauth.login();
      } catch (e) {
        throw new Error(`Failed to login ${e}`);
      }

      token = this._oauth.token;
    }

    if (token === null) {
      throw new Error(`Failed to login, token is null`);
    }

    await this.postLogin(token);
  }

  public get oauth(): OAuth {
    return this._oauth;
  }

  private async postLogin(token: string) {
    const userInfo = this._oauth.userInfo;

    if (userInfo === null) {
      throw new Error(`Failed to get user info`);
    }

    const info = await userInfo.info;

    await this.setCredentials(token, info.username);

    this.setupEvents();
  }

  private setupEvents() {
    this._oauth.on('tokenUpdated', () => {
      if (this._oauth.token === null) {
        throw new Error('Got a null token after refreshing it');
      }

      this.setApiKey(this._oauth.token);
    });
  }
}
