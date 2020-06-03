export function colorValidation(color: string) {
  return _isHexcolor(color);
}

export function sizeRangeValidation(sizeRange: number[]) {
  return (
    sizeRange.length === 2 && sizeRange[0] > 0 && sizeRange[1] > sizeRange[0]
  );
}

function _isHexcolor(color: string) {
  return (
    color.startsWith('#') &&
    [4, 5, 7, 9].includes(color.length) &&
    !isNaN(Number(`0x${color.substring(1)}`)) // eslint-disable-line no-restricted-globals
  );
}
