import {
  DOSource,
  CARTOSource,
  colorBinsStyle,
  sizeBinsStyle,
  colorCategoriesStyle,
  sizeCategoriesStyle,
  createGoogleMap,
  createMap,
  Layer
} from '@carto/toolkit-viz';

export { OAuth } from '@carto/toolkit-auth';
export { Credentials, setDefaultCredentials } from '@carto/toolkit-core';
export { SQL } from '@carto/toolkit-sql';
export { default as App } from './App';
export { default as OAuthApp } from './OAuthApp';

export const viz = {
  DOSource,
  CARTOSource,
  colorBinsStyle,
  colorCategoriesStyle,
  sizeBinsStyle,
  sizeCategoriesStyle,
  createGoogleMap,
  createMap,
  Layer
};

// TODO: This should not be public
export { CustomStorage } from '@carto/toolkit-custom-storage';
