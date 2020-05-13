/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint no-param-reassign: ["error", { "props": false }] */

import { MVTLayer } from '@deck.gl/geo-layers';
import { CartoError } from '@carto/toolkit-core';
import { TileLayerProps } from '@deck.gl/geo-layers/tile-layer/tile-layer';
import { ViewportTile } from '../../declarations/deckgl';

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

export function getURLFromTemplate(
  template: string | string[],
  properties: any
) {
  if (!template || !template.length) {
    return null;
  }

  let templateURL = template;

  if (Array.isArray(template)) {
    const index = Math.abs(properties.x + properties.y) % template.length;
    templateURL = template[index];
  }

  return (templateURL as string).replace(
    /\{ *([\w_-]+) *\}/g,
    (_, property: string) => properties[property]
  );
}

const defaultProps = {
  geographiesData: { type: 'array', optional: true, value: [], compare: true }
};

export class DOLayer<T> extends MVTLayer<T> {
  static layerName: string;
  static defaultProps: Record<string, object>;

  getTileData(tile: ViewportTile) {
    const { geographiesData } = this.props as DOLayerProps<T>;
    const geographiesURL = getURLFromTemplate(geographiesData, tile);

    if (!geographiesURL) {
      throw Error('Invalid geographies URL');
    }

    return Promise.all([
      super.getTileData(tile),
      loadData(geographiesURL, this.getLoadOptions())
    ]).then(([geographies, data]) => {
      if (!data) {
        return Promise.reject(
          new CartoError({
            type: 'DOLayer',
            message: `No data available for ${tile.x} ${tile.y} ${tile.z} tile in Data Observatory`
          })
        );
      }

      return geographies.map((geography: GeoJSON.Feature) => {
        if (!geography || !geography.properties) {
          return {};
        }

        return {
          ...geography,
          properties: {
            ...geography.properties,
            ...data.data[geography.properties?.geoId]
          }
        };
      });
    });
  }
}

DOLayer.layerName = 'DOLayer';
DOLayer.defaultProps = defaultProps;

export interface DOLayerProps<D> extends TileLayerProps<D> {
  geographiesData: string | string[];
}
