import CustomStorage from '../src/index';

describe('custom-storage', () => {
  it('constructor', () => {
    const cs = new CustomStorage('name');

    expect(cs).not.toBe(null);
  });
});
