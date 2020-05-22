export function colorValidation(color: string) {
  return _isHexcolor(color);
}

function _isHexcolor(color: string) {
  return (
    color.startsWith('#') &&
    [4, 7, 9].includes(color.length) &&
    !!Number(`0x${color.substring(1)}`)
  );
}
