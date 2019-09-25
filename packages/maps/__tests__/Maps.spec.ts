import Maps from '../src';

describe('maps', () => {
  it('should have credentials', () => {
    const m = new Maps('roman-carto', 'wadus');
    expect(m.username).toBe('roman-carto');
    expect(m.apiKey).toBe('wadus');
  });
});
