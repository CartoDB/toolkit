import Credentials from '../src/Credentials';

describe('auth/Credentials', () => {
  it('should require an API key and a username', () => {
    const creds = new Credentials(
      'roman-carto',
      'wadus'
    );

    expect(creds.username).toBe('roman-carto');
    expect(creds.apiKey).toBe('wadus');
  });

  it('should fail if api key or username are not present', () => {
    expect(() => {
      const creds = new Credentials('roman-carto', undefined as any);
      expect(creds.username).toBe('roman-carto');
    }).toThrow();

    expect(() => {
      const creds = new Credentials(undefined as any, 'wadus');
      expect(creds.username).toBe(undefined);
    }).toThrow();
  });
});
