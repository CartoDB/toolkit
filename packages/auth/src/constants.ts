export const CARTO_AUTHORIZATION_BASE = 'https://www.carto.com/oauth2';
export const THRESHOLD = 1000 * 5 * 60;

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