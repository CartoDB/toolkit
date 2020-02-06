import { Credentials } from '@carto/toolkit-core';
import { Maps as Client} from '../src/Client';

describe('maps', () => {
  it('can be easily created', () => {
    const credentials = new Credentials('aUser', 'anApiKey');
    const m = new Client(credentials);
    expect(m).toBeTruthy();
  });

  describe('create a simple map', () => {
    it('fails without dataset or sql query', async () => {
      const credentials = new Credentials('aUser', 'anApiKey');
      const m = new Client(credentials);
      await expect(m.instantiateMapFrom({})).rejects
        .toThrowError('Please provide a dataset or a SQL query');
    });
  });
});
