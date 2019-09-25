import Maps from '../src';

describe('maps', () => {
  it('should have credentials', () => {
    const m = new Maps('a-user', 'wadus');
    expect(m.username).toBe('a-user');
    expect(m.apiKey).toBe('wadus');
  });

  it('can manage different servers', () =>{
    const m = new Maps('a-user', 'wadus');
    expect(m.serverURL).toBe('https://{user}.carto.com');

    const customServer = 'http://127.0.0.1:8181/user/{user}';
    const m2 = new Maps('a-user', 'wadus', customServer);
    expect(m2.serverURL).toBe(customServer);
  });

});
