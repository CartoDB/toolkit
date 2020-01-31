export class UserInfo {
  private _apiKey: string;
  private _url: string;

  constructor(apiKey: string, url: string) {
    this._apiKey = apiKey;
    this._url = url;
  }

  get info() {
    return fetch(`${this._url}?api_key=${this._apiKey}`)
      .then((response) => response.json());
  }
}

export default UserInfo;
