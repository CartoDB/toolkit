class Credentials {
  private _username: string;
  private _apiKey: string;

  constructor(username: string, apiKey: string) {
    if (!username) {
      throw new Error('Username is required');
    }

    if (!apiKey) {
      throw new Error('Api key is required');
    }

    this._username = username;
    this._apiKey = apiKey;
  }

  public get username(): string {
    return this._username;
  }

  public get apiKey(): string {
    return this._apiKey;
  }
}

export default Credentials;