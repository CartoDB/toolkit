import { Credentials } from '@carto/toolkit-core';
import { SQL as Client } from '../src/Client';

describe('Client', () => {
  it('can be easily created', () => {
    const credentials = new Credentials('aUser', 'anApiKey');
    const client = new Client(credentials);
    expect(client).toBeTruthy();
  });
});
