export function getRequest(url: string) {
  return new Request(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });
}

export function postRequest(url: string, payload: string) {
  return new Request(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: payload
  });
}

export function encodeParameter(name: string, value: string) {
  return `${name}=${encodeURIComponent(value)}`;
}
