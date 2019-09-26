import RequestManager from '../src/RequestManager';

describe('RequestManager', () => {
  beforeEach(() => {
    const mockJson = Promise.resolve({
      wadus: true,
      username: 'roman-carto'
    });

    const mockFetch = Promise.resolve({
      json: () => mockJson
    });

    (global as any).fetch = jest.fn().mockImplementation(() => mockFetch);
  });

  it('should require username, api key and a server', () => {
    const rm = new RequestManager({ username: 'roman', apiKey: 'wadus', server: '{user}.wadus.com' });

    expect(rm.username).toBe('roman');
    expect(rm.apiKey).toBe('wadus');
    expect(rm.server).toBe('roman.wadus.com');
  });

  it('should queue requests FIFO', () => {
    const rm = new RequestManager({ username: 'roman', apiKey: 'wadus', server: '{user}.wadus.com' });


  });
});
