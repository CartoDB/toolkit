import { Deck } from '@deck.gl/core';
import { Source } from '../sources';
import { CartoStylingError } from '../errors/styling-error';

export interface StyledLayer {
  getMapInstance(): Deck;
  source: Source;
}

export function pixel2meters(meters: number, layer: StyledLayer) {
  const map = layer.getMapInstance();
  const viewports = map.getViewports(undefined);

  if (viewports.length > 0) {
    const { metersPerPixel } = viewports[0];
    return meters * metersPerPixel;
  }

  throw new CartoStylingError('Cannot get map viewport');
}
