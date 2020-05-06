import { Style, DefaultStyleOptions, defaultStyleOptions } from '..';
import { LayerStyle } from '../layer-style';
import { toDeckStyles } from './style-transform';

export function basicStyle(options?: DefaultStyleOptions) {
  const opts = { ...defaultStyleOptions, ...options };

  const evalFN = (layer: LayerStyle) => {
    const meta = layer.source.getMetadata();
    return toDeckStyles(meta.geometryType, opts);
  };

  return new Style(evalFN);
}
