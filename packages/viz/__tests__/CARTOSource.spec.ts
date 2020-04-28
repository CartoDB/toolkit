import {
  Credentials,
  defaultCredentials,
  setDefaultCredentials
} from '@carto/toolkit-core';

import { CARTOSource } from '../src/lib/sources/CARTOSource';

const TEST_CREDENTIALS = {
  username: 'test_username',
  apiKey: 'default_public',
  serverUrlTemplate: 'https://{user}.example.com'
};

const DEFAULT_DATASET = 'default_dataset';

describe('CARTOSource', () => {
  describe('Source creation', () => {
    it('should create a new Layer instance properly', () => {
      expect(() => new CARTOSource(DEFAULT_DATASET)).not.toThrow();
    });
  });

  describe('Credentials', () => {
    beforeEach(() => {
      setDefaultCredentials({ ...TEST_CREDENTIALS });
    });

    it('should use provided credentials', () => {
      const credentials = new Credentials(
        'not_default_username',
        'not_default_apikey',
        'https://notdefaultserver.com'
      );

      const source = new CARTOSource(DEFAULT_DATASET, { credentials });
      expect(source.credentials).toBe(credentials);
    });

    it('should use default credentials if not provided', () => {
      const source = new CARTOSource(DEFAULT_DATASET);
      expect(source.credentials).toBe(defaultCredentials);
    });
  });
});
