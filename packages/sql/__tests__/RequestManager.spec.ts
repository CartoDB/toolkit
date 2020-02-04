import { Credentials } from '@carto/toolkit-core';
import RequestManager from '../src/RequestManager';

describe('RequestManager', () => {
  it('can be easily created', () => {
    const credentials = new Credentials('aUser', 'anApiKey');
    const endpointServerURL = credentials.serverURL + 'api/v2/sql';

    const rm = new RequestManager(credentials, endpointServerURL);
    expect(rm).toBeTruthy();
  });
});
