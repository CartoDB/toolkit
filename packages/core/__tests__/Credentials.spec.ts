import { Credentials } from '../src/Credentials';

describe('auth/Credentials', () => {
  it('should require a username and an API key', () => {
    const creds = new Credentials('aUserName', 'anApiKey');

    expect(creds.username).toBe('aUserName');
    expect(creds.apiKey).toBe('anApiKey');
  });

  it('should fail if api key or username are not present', () => {
    expect(() => {
      const creds = new Credentials('aUserName', undefined as any);
      expect(creds.username).toBe('aUserName');
    }).toThrow();

    expect(() => {
      const creds = new Credentials(undefined as any, 'anApiKey');
      expect(creds.username).toBe(undefined);
    }).toThrow();
  });

  it('has a default server', () => {
    const creds = new Credentials('aUser', 'anApiKey');
    expect(creds.serverURL).toBe('https://aUser.carto.com/');
  });

  it('can manage different servers', () => {
    const customServer = 'http://127.0.0.1:8181/user/{user}';
    const creds = new Credentials('aUser', 'anApiKey', customServer);
    expect(creds.serverURL).toBe('http://127.0.0.1:8181/user/aUser/');
  });

});
