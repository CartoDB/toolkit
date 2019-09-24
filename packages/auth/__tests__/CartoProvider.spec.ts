import CartoProvider from '../src/CartoProvider';

describe('CartoProvider', () => {
  beforeEach(() => {
    let storage: any = {};
    (global as any).localStorage = {
      getItem(item: any) {
        return storage[item];
      },

      setItem(item: any, value: any) {
        storage[item] = value;
      },

      removeItem(item: any) {
        delete storage[item];
      },

      clear() {
        storage = {};
      }
    };
  });

  afterEach(() => {
    delete (global as any).localStorage;
  });

  it('should save user info url on storage', () => {
    const firstProvider = new CartoProvider();

    firstProvider.set('state', 'lul');

    firstProvider.$validate({
      state: 'lul',
      access_token: 'wadus',
      code: 'wadus',
      expires_in: '3600',
      token_type: 'bearer',
      user_info_url: 'url'
    } as any);

    const secondProvider = new CartoProvider();
    secondProvider.sync();

    expect(secondProvider.userInfo).toBe('url');
  });
});
