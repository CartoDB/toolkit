import {
  colorBinsStyle,
  sizeBinsStyle,
  colorCategoriesStyle,
  sizeCategoriesStyle,
  Layer,
  DOSource,
  CARTOSource
} from '@carto/toolkit-viz';

export { OAuth } from '@carto/toolkit-auth';
export { Credentials, setDefaultCredentials } from '@carto/toolkit-core';
export { SQL } from '@carto/toolkit-sql';
export { default as App } from './App';
export { default as OAuthApp } from './OAuthApp';
export const viz = {
  DOSource,
  CARTOSource,
  Layer,
  colorBinsStyle,
  colorCategoriesStyle,
  sizeBinsStyle,
  sizeCategoriesStyle
};

// TODO: This should not be public
export { CustomStorage } from '@carto/toolkit-custom-storage';
