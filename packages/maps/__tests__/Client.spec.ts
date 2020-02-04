import { Maps as Client} from '../src/Client';

describe('maps', () => {
  it('can be easily created', () => {
    const m = new Client('aUser', 'anApiKey');
    expect(m).toBeTruthy();
  });

  it('requires credentials', () => {
    expect(() => {
      // tslint:disable-next-line: no-unused-expression
      new Client('', '');
    }).toThrow('Username is required');
  });

  describe('create a simple map', () => {
    it('fails without dataset or sql query', async () => {
      const m = new Client('a-user', 'wadus');
      await expect(m.instantiateMapFrom({})).rejects
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
