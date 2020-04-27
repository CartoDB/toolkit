import { createGoogleMap, createMap } from '../src/lib/basemap';

describe('createMap (mapbox)', () => {
  it('should create a carto voyager world basemap when no params', () => {
    expect(() => createMap().not.toThrow());
  });

  it('should allow using carto basemaps', () => {
    const cartoMapStyles = ['positron', 'voyager', 'darkmatter'];
    cartoMapStyles.forEach(mapStyle => {
      expect(() => createMap({ basemap: mapStyle }).not.toThrow());
    });

    expect(() => createMap({ basemap: 'whatever' }).toThrow());
  });

  it('should allow specifying view params', () => {
    expect(() =>
      createMap({
        view: {
          zoom: 4,
          longitude: 3,
          latitude: 40,
          pitch: 45,
          bearing: 30
        }
      }).not.toThrow()
    );
  });
});

describe('createGoogleMap', () => {
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
