import OAuth from '../src/OAuth';

describe('auth/OAuth', () => {
  it('should require a client id', () => {
    const oauth = new OAuth('wadus_id');

    expect(oauth.clientId).toBe('wadus_id');

    expect(() => {
      const useless = new OAuth(undefined as any);
      expect(useless.clientId).toBeUndefined();
    });
  });
});
