// import deck from 'deck.gl';
import { Credentials } from '@carto/toolkit-core';
import CartoTileLayer from '../src/CartoTileLayer';

describe('Viz - CartoTileLayer', () => {

  let credentials: Credentials;
  let buildMVT: any;

  beforeAll(() => {
    credentials = new Credentials('aUser', 'anApiKey');

    buildMVT = jest.fn();
    window.deck = { MVTTileLayer: buildMVT }
  });

  it('allows the use of a dataset name', () => {
    const dataset = 'populated_places';
    const layer = new CartoTileLayer(dataset, { credentials});
    expect(layer).toBeTruthy();
  });

  it('allows the use of a SQL', () => {
    const sql = 'SELECT * FROM populated_places';
    const layer = new CartoTileLayer(sql, { credentials});
    expect(layer).toBeTruthy();
  });

  it('instantiates a map when building a deck layer', async() => {
    const layer = new CartoTileLayer('places', {
      deckInstance: credentials });

    const deckglLayer = await layer.buildDeckglLayer();
    expect(deckglLayer).toBeTruthy();
    expect(buildMVT).toHaveBeenCalled();

  });
});
