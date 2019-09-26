import { SCOPES } from './constants';

export type Pair<T> = [T, T];

export function knownScope(scope: string) {
  return SCOPES.some((S) => S.exec(scope) !== null);
}

export function unknownScopes(scopes: string[]) {
  return scopes.filter(
    (scope) => !knownScope(scope)
  );
}

export function buildParams(params: Array<Pair<string>>) {
  return encodeURI(params.map((param) => {
    return `${param[0]}=${param[1]}`;
  }).join('&'));
}
