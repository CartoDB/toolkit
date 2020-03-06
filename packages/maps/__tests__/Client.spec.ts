import { Credentials } from '@carto/toolkit-core';
import { MapOptions, Maps as Client} from '../src/Client';

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

      const mapOptions: MapOptions = {
        vector_extent: 2048,
        vector_simplify_extent: 2048
      };

      await expect(m.instantiateMapFrom(mapOptions)).rejects
        .toThrowError('Please provide a dataset or a SQL query');
    });
  });
});
