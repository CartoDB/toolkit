import { Classifier } from '../src/lib/utils/Classifier';

import * as mapsResponse from './data-mocks/maps.number.json';

const mapStats = mapsResponse.metadata.layers[0].meta.stats;
const sample = mapStats.sample.map(s => s.pct_higher_ed);
const stats = {
  ...mapStats.columns.pct_higher_ed,
  sample
};

describe('Classifier', () => {
  describe('Classifier creation', () => {
    it('should create a sizeBinsStyle instance properly', () => {
      expect(() => new Classifier(stats)).not.toThrow();
    });
  });

  describe('Classifier methods', () => {
    const classifier = new Classifier(stats);

    it('Quantiles', () => {
      const breaks = classifier.breaks(4, 'quantiles');
      const expectedBreaks = [
        40.6120458424774,
        46.377123199312,
        52.3537721984659,
        59.0780969734932
      ];
      expect(breaks).toMatchObject(expectedBreaks);
    });

    it('Equal', () => {
      const breaks = classifier.breaks(4, 'equal');
      const expectedBreaks = [
        34.65714291396062,
        47.96506670056654,
        61.27299048717246,
        74.58091427377838
      ];
      expect(breaks).toMatchObject(expectedBreaks);
    });

    it('StandardDev', () => {
      const breaks = classifier.breaks(4, 'stdev');
      const expectedBreaks = [
        28.762902879178785,
        39.44729714406859,
        60.816085673848214,
        71.50047993873802
      ];
      expect(breaks).toMatchObject(expectedBreaks);
    });
  });
});
