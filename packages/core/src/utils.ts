/**
 * Unique Identifier v4
 * Adapted from https://stackoverflow.com/a/2117523/251834
 */
export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // tslint:disable-next-line: no-bitwise
    const r = Math.random() * 16 | 0;
    // tslint:disable-next-line: no-bitwise
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
