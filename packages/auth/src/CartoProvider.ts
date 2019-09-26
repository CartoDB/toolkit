import { OAuth2Provider } from '@salte-auth/salte-auth';
import { ALREADY_EXPIRED } from './constants';

interface CartoValidation extends OAuth2Provider.Validation {
  user_info_url: string;
}

export class CartoProvider extends OAuth2Provider {
  private _userInfo: string = this.get('user_info');

  get name() {
    return 'carto';
  }

  get login() {
    return `${this.config.url}/authorize`;
  }

  get logout() {
    return `${this.config.url}/logout`;
  }

  get userInfo() {
    return this._userInfo;
  }

  public $validate(options: CartoValidation): void {
    super.$validate(options);

    this._userInfo = decodeURIComponent(options.user_info_url);
    this.set('user_info', this._userInfo);
  }

  public sync() {
    super.sync();
    this._userInfo = this.get('user_info');
  }

  public get expired() {
    return this.accessToken && this.accessToken.expired;
  }

  /**
   * Returns Expiration date for current token, or -1 if already expired
   *
   * @readonly
   * @type {number}
   * @memberof CartoProvider
   */
  get expiresIn(): number {
    if (this.accessToken === undefined) {
      return ALREADY_EXPIRED;
    }

    return this.accessToken.expiration;
  }
}

export default CartoProvider;
