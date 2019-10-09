const unauthorized = (config: any) => {
  throw new Error(
      `Unauthorized access to Maps API: invalid combination of user ('${config.username}') and apiKey ('${config.apiKey}')`
    );
};

const unauthorizedDataset = (config: any) => {
  throw new Error(
      `Unauthorized access to dataset: the provided apiKey('${config.apiKey}') doesn't provide access to the requested data`
    );
};

export default {
  [401 as number]: unauthorized,
  [403 as number]: unauthorizedDataset
};
