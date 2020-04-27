import { createGoogleMap, createMap } from '../src/lib/basemap/index';

describe('createMap (mapbox)', () => {
  it('should create a carto voyager world basemap when no params', () => {
    expect(() => createMap().not.toThrow());
  });

  it('should allow using carto basemaps', () => {
    const allowed = ['positron', 'voyager', 'darkmatter'];
    allowed.forEach(basemap => {
      expect(() => createMap(basemap).not.toThrow());
    });

    expect(() => createMap('whatever').toThrow());
  });

  it('should allow specifying view params', () => {
    const aBasemap = 'voyager';
    expect(() =>
      createMap(aBasemap, {
        zoom: 4,
        longitude: 3,
        latitude: 40,
        pitch: 45,
        bearing: 30
      }).not.toThrow()
    );
  });
});

describe('gmap (google)', () => {
  it('should create a world road google basemap when no params', () => {
    expect(() => createGoogleMap().not.toThrow());
  });

  it('should allow using gmaps basemaps', () => {
    const allowed = ['hybrid', 'roadmap', 'satellite', 'terrain'];
    allowed.forEach(basemap => {
      expect(() => createGoogleMap(basemap).not.toThrow());
    });

    expect(() => createGoogleMap('whatever').toThrow());
  });

  it('should allow specifying view params', () => {
    const aBasemap = 'terrain';
    expect(() =>
      createGoogleMap(aBasemap, {
        zoom: 4,
        center: { lng: 3, lat: 40 }
      }).not.toThrow()
    );
  });
});
