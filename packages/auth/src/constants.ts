export const CARTO_AUTHORIZATION_BASE = 'https://carto.com/oauth2';
export const THRESHOLD = 1000 * 5 * 60;
export const ALREADY_EXPIRED = -1;
export const NO_TIMEOUT = -1;
export const REFRESH_STATE_PREFIX = '6574686572766f69642d74726169746f72';

export const SCOPES: RegExp[] = [
  /offline/,
  /dataservices:geocoding/,
  /dataservices:isolines/,
  /dataservices:routing/,
  /dataservices:observatory/,
  /datasets:r:.+/,
  /datasets:w:.+/,
  /datasets:rw:.+/,
  /schemas:c/,
  /datasets:metadata/
];
