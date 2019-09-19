class OAuth {
  private _clientId: string;

  constructor(clientId: string) {
    this._clientId = clientId;
  }

  public get clientId(): string {
    return this._clientId;
  }
}

export default OAuth;