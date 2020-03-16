// TODO: Should we export setDefaultCredentials from here,
// or just from top package?
export { setDefaultCredentials } from '@carto/toolkit-core';

export { Layer } from './lib/Layer';

// Style helpers
export {
  colorBinsStyle,
  colorCategoriesStyle
} from './lib/style';
