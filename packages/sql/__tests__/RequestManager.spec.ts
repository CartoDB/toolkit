import RequestManager from '../src/RequestManager';

describe('RequestManager', () => {
  it('should require username, api key and a server', () => {
    const rm = new RequestManager({ username: 'roman', apiKey: 'wadus', server: '{user}.wadus.com' });

    expect(rm.username).toBe('roman');
    expect(rm.apiKey).toBe('wadus');
    expect(rm.server).toBe('roman.wadus.com');
  });
});
