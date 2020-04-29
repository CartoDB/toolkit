/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint no-param-reassign: ["error", { "props": false }] */

import { MVTLayer } from '@deck.gl/geo-layers';
import { load } from '@loaders.gl/core';
import { MVTLoader } from '@loaders.gl/mvt';
import Tile from '@deck.gl/geo-layers/tile-layer/utils/tile';

async function loadData(url: string, options: any) {
  const data = await fetch(url, options);

  switch (data.status) {
    case 200:
    case 206:
      return data.json();
    case 204:
      return null;
    default:
      throw Error('Unexpected error fetching tile from data endpoint');
  }
}

export function getURLFromTemplate(template: any, properties: any) {
  if (!template || !template.length) {
    return null;
  }

  let t = template;

  if (Array.isArray(template)) {
    const index = Math.abs(properties.x + properties.y) % template.length;
    t = template[index];
  }

  return t.replace(
    /\{ *([\w_-]+) *\}/g,
    (_: any, property: any) => properties[property]
  );
}

export class DOLayer extends MVTLayer<any> {
  async getTileData(tile: Tile) {
    const geographiesURL = getURLFromTemplate(
      this.props.geographiesURLTemplate,
      tile
    );

    if (!geographiesURL) {
      throw Error('Invalid geographies URL');
    }

    const dataURL = getURLFromTemplate(this.props.dataURLTemplate, tile);

    if (!dataURL) {
      throw Error('Invalid data URL');
    }

    // Run two request in parallel
    const geographiesJob = load(
      geographiesURL,
      MVTLoader,
      this.getLoadOptions()
    );
    const dataJob = loadData(dataURL, this.getLoadOptions());

    // Wait for the result
    const geographies = await geographiesJob;
    const data = await dataJob;

    if (data) {
      // Do the join
      geographies.forEach((geo: GeoJSON.Feature) => {
        if (geo !== null && geo.properties != null) {
          geo.properties = Object.assign(
            geo.properties,
            data.data[geo.properties.geoid]
          );
        }
      });
    }

    return geographies;
  }
}
