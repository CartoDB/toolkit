
import { gmap, map } from '../src/lib/basemap';

describe('map (mapbox)', () => {
    it('should create a carto voyager world basemap when no params', () => {
      expect(() => map().not.toThrow());
    });

    it('should allow using carto basemaps', () => {
      const allowed = ['positron', 'voyager', 'darkmatter'];
      allowed.forEach((basemap) => {
        expect(() => map(basemap).not.toThrow());
      });

      expect(() => map('whatever').toThrow());
    });

    it('should allow specifying view params', () => {
      const aBasemap = 'voyager';
      expect(() => map(aBasemap, { zoom: 4, longitude: 3, latitude: 40, pitch: 45, bearing: 30 }).not.toThrow());
    });
});

describe('gmap (google)', () => {
  it('should create a world road google basemap when no params', () => {
    expect(() => gmap().not.toThrow());
  });

  it('should allow using gmaps basemaps', () => {
    const allowed = ['hybrid', 'roadmap', 'satellite', 'terrain'];
    allowed.forEach((basemap) => {
      expect(() => gmap(basemap).not.toThrow());
    });

    expect(() => gmap('whatever').toThrow());
  });

  it('should allow specifying view params', () => {
    const aBasemap = 'terrain';
    expect(() => gmap(aBasemap, { zoom: 4, center: { lng: 3, lat: 40 } }).not.toThrow());
  });

});
