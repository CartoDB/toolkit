import {
  DOSource,
  CARTOSource,
  basicStyle,
  colorBinsStyle,
  colorCategoriesStyle,
  colorContinuousStyle,
  sizeBinsStyle,
  sizeCategoriesStyle,
  sizeContinuousStyle,
  createGoogleMap,
  createMap,
  Layer,
  Popup
} from '@carto/toolkit-viz';

import { CategoryDataView } from '@carto/toolkit-data';

export { OAuth } from '@carto/toolkit-auth';
export { Credentials, setDefaultCredentials } from '@carto/toolkit-core';
export { SQL } from '@carto/toolkit-sql';
export { default as App } from './App';
export { default as OAuthApp } from './OAuthApp';

export const viz = {
  DOSource,
  CARTOSource,
  basicStyle,
  colorBinsStyle,
  colorCategoriesStyle,
  colorContinuousStyle,
  sizeBinsStyle,
  sizeCategoriesStyle,
  sizeContinuousStyle,
  createGoogleMap,
  createMap,
  Layer,
  Popup
};

export const data = {
  CategoryDataView
};

// TODO: This should not be public
export { CustomStorage } from '@carto/toolkit-custom-storage';
