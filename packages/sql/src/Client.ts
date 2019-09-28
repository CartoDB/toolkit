import { DEFAULT_SERVER } from './constants';
import { CopyToManager } from './CopyToManager';
import { QueryManager } from './QueryManager';

export class SQL {
  private _copyToManager: CopyToManager;
  private _queryManager: QueryManager;

  constructor(username: string, apiKey: string, server: string = DEFAULT_SERVER) {
    const baseServer = server.replace('{user}', username);
    this._copyToManager = new CopyToManager({ username, apiKey, server: baseServer });
    this._queryManager = new QueryManager({ username, apiKey, server: baseServer });
  }

  public copyTo(q: string) {
    return this._copyToManager.query(q);
  }

  public exportURL(q: string) {
    return this._copyToManager.copyUrl(q);
  }

  public query(q: string) {
    return this._queryManager.query(q);
  }
}
