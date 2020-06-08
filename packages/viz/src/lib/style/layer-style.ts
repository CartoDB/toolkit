import { Deck } from '@deck.gl/core';
import { Source } from '../sources';

export interface StyledLayer {
  getMapInstance(): Deck;
  source: Source;
}
