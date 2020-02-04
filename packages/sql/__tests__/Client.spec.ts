import { SQL as Client } from '../src/Client';

describe('Client', () => {
  it('can be easily created', () => {
    const client = new Client('aUser', 'anApiKey');
    expect(client).toBeTruthy();
  });
});
