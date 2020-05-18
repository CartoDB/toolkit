/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint no-param-reassign: ["error", { "props": false }] */

import { MVTLayer } from '@deck.gl/geo-layers';
import { TileLayerProps } from '@deck.gl/geo-layers/tile-layer/tile-layer';
import { GeoJsonProperties } from 'geojson';
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
    const { metadata } = this.props as DOLayerProps<T>;
    const metadataURL = getURLFromTemplate(metadata, tile);

    if (!metadataURL) {
      throw Error('Invalid geographies URL');
    }

    return this.loadGeographiesAndData(tile, metadataURL).then(
      ([geographies, data]) => {
        if (!data) {
          // A tile could have empty data
          return geographies;
        }

        return joinGeographiesWithData(geographies, data);
      }
    );
  }

  private loadGeographiesAndData(tile: ViewportTile, metadataURL: string) {
    return Promise.all([
      super.getTileData(tile),
      loadData(metadataURL, this.getLoadOptions())
    ]);
  }
}

DOLayer.layerName = 'DOLayer';
DOLayer.defaultProps = defaultProps;

function joinGeographiesWithData(
  geographies: GeoJSON.Feature[],
  { data }: { data: Record<string | number, GeoJsonProperties> }
) {
  return geographies.map((geography: GeoJSON.Feature) => {
    if (!geography || !geography.properties) {
      return {};
    }

    return {
      ...geography,
      properties: {
        ...data[geography.properties?.geoid],
        ...geography.properties
      }
    };
  });
}

export interface DOLayerProps<D> extends TileLayerProps<D> {
  // Tile URL Template for geographies. It should be in the format of https://server/{z}/{x}/{y}..
  data: any;

  // Tile URL Template for data. It should be in the format of https://server/{z}/{x}/{y}..
  metadata: string | string[];
}
