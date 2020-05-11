import { StyledLayer } from '../layer-style';
import { Style, BasicOptionsStyle, getStyles } from '..';

export function basicStyle(options: Partial<BasicOptionsStyle>) {
  const evalFN = (layer: StyledLayer) => {
    const meta = layer.source.getMetadata();
    return getStyles(meta.geometryType, options);
  };

  return new Style(evalFN);
}
