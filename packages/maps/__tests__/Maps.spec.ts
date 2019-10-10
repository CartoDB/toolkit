import Maps from '../src';

describe('maps', () => {

  it('should have credentials', () => {
    const m = new Maps('a-user', 'wadus');
    expect(m.username).toBe('a-user');
    expect(m.apiKey).toBe('wadus');
  });

  it('can manage different servers', () => {
    const m = new Maps('a-user', 'wadus');
    expect(m.serverURL).toBe('https://a-user.carto.com');

    const customServer = 'http://127.0.0.1:8181/user/{user}';
    const m2 = new Maps('a-user', 'wadus', customServer);
    expect(m2.serverURL).toBe('http://127.0.0.1:8181/user/a-user');
  });

  describe ('create simple map', () => {

    it('fails without dataset or sql query', async () => {
      const m = new Maps('a-user', 'wadus');
      await expect (m.instantiateMapFrom({})).rejects
        .toThrowError('Please provide a dataset or a SQL query');
    });

    // TODO: extract e2e
    // it('accepts user without apiKey for public', async () => {
    //   const m = new Maps('cartovl', '');
    //   await expect (m.instantiateSimpleMap({ dataset: 'populated_places'}))
    //     .not.toThrowError('Failed to connect to Maps API with the user');
    // });
  });
});
