import { Credentials } from '@carto/toolkit-core';
import { CustomStorage } from '../src/CustomStorage';

describe('CustomStorage', () => {
  const NAMESPACE = 'keplergl';
  const someCredentials = new Credentials('aUser', 'anApiKey');

  describe('client', () => {
    it('should have a default client if not specified', () => {
      const storage = new CustomStorage(NAMESPACE, someCredentials);
      expect(storage.client).toBe(NAMESPACE);
    });

    it('should allow specifiying a different source', () => {
      const options = {
        client: 'carto-dashboard'
      };
      const storage = new CustomStorage(NAMESPACE, someCredentials, options);
      expect(storage.client).not.toBe(NAMESPACE); // for tables
      expect(storage.client).toBe(options.client); // for metrics events
    });
  });
});
