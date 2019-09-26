import { buildParams, knownScope, Pair, unknownScopes } from '../src/utils';

describe('auth/utils', () => {
  describe('knownScope', () => {
    it('should check whether a scope is valid or not', () => {
      expect(knownScope('offline')).toBe(true);
      expect(knownScope('dataservices:geocoding')).toBe(true);
      expect(knownScope('dataservices:isolines')).toBe(true);
      expect(knownScope('dataservices:routing')).toBe(true);
      expect(knownScope('dataservices:observatory')).toBe(true);
      expect(knownScope('datasets:rw:blargh')).toBe(true);
      expect(knownScope('datasets:r:blargh')).toBe(true);
      expect(knownScope('datasets:w:blargh')).toBe(true);
      expect(knownScope('schemas:c')).toBe(true);
      expect(knownScope('datasets:metadata')).toBe(true);

      expect(knownScope('datasets:w:')).toBe(false);
      expect(knownScope('wadus')).toBe(false);
    });
  });

  describe('unknownScopes', () => {
    const scopes = [
      'datasets:rw:wadus',
      'invent',
      'dataservices:fluxcapaciting',
      'datasets:w:wadus',
      'datasets:metadata',
      'schemas:c'
    ];

    const unknown = unknownScopes(scopes);

    expect(unknown).toHaveLength(2);
    expect(unknown).toContain('invent');
    expect(unknown).toContain('dataservices:fluxcapaciting');
  });

  describe('buildParams', () => {
    it('should work with a single param', () => {
      const params = [
        ['a', 'b']
      ] as Array<Pair<string>>;

      expect(buildParams(params)).toBe('a=b');
    });

    it('should join basic strings together', () => {
      const params = [
        ['a', 'b'],
        ['c', 'd']
      ] as Array<Pair<string>>;

      expect(buildParams(params)).toBe('a=b&c=d');
    });

    it('should encode URI string properly', () => {
      const params = [
        ['scopes', 'b c d']
      ] as Array<Pair<string>>;

      expect(buildParams(params)).toBe('scopes=b%20c%20d');
    });
  });
});
