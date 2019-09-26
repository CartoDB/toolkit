import UserInfo from '../src/UserInfo';

describe('userInfo', () => {
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

  afterEach(() => {
    (global as any).fetch.mockClear();
    delete (global as any).fetch;
  });

  it('should fetch the user info from the url using the api key', () => {
    const userInfo = new UserInfo('foo', 'wadus');
    const info = userInfo.info;

    expect(info).not.toBeNull();
    expect(window.fetch).toHaveBeenCalledWith('wadus?api_key=foo');
  });

  it('should return a promise with the user info', (done) => {
    const userInfo = new UserInfo('foo', 'wadus');

    userInfo.info.then((d) => {
      expect(d.username).toBe('roman-carto');

      done();
    });
  });
});
