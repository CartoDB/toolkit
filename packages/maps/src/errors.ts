import { Credentials } from '@carto/toolkit-core';

const unauthorized = (credentials: Credentials) => {
  throw new Error(
      `Unauthorized access to Maps API: invalid combination of user ('${credentials.username}') and apiKey ('${credentials.apiKey}')`
    );
};

const unauthorizedDataset = (credentials: Credentials) => {
  throw new Error(
      `Unauthorized access to dataset: the provided apiKey('${credentials.apiKey}') doesn't provide access to the requested data`
    );
};

export default {
  [401 as number]: unauthorized,
  [403 as number]: unauthorizedDataset
};
