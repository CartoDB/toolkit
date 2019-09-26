import { DEFAULT_SERVER } from './constants';
import RequestManager from './RequestManager';

export class SQL {
  private _queryManager: RequestManager;
  private _copyFromManager: RequestManager;

  constructor(username: string, apiKey: string, server: string = DEFAULT_SERVER) {
    const baseServer = server.replace('{user}', username);
    this._queryManager = new RequestManager({ username, apiKey, server: `${baseServer}/api/v2/sql` });
    this._copyFromManager = new RequestManager({ username, apiKey, server: `${baseServer}/api/v2/sql/copyfrom` });
  }
}
