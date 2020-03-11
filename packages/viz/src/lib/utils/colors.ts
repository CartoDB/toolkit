// Extracted from https://github.com/CartoDB/carto-vl/blob/develop/src/renderer/viz/expressions/utils.js#L53
export function hexToRgb(hex: string) {
  // Evaluate #ABC
  let result = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(hex);
  if (result) {
      return [
          parseInt(result[1] + result[1], 16),
          parseInt(result[2] + result[2], 16),
          parseInt(result[3] + result[3], 16),
          255
      ];
  }

  // Evaluate #ABCD
  result = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(hex);
  if (result) {
      return [
          parseInt(result[1] + result[1], 16),
          parseInt(result[2] + result[2], 16),
          parseInt(result[3] + result[3], 16),
          parseInt(result[4] + result[4], 16)
      ];
  }

  // Evaluate #ABCDEF
  result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
      return [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
        255
      ];
  }

  // Evaluate #ABCDEFAF
  result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
      return [
        parseInt(result[1], 16),
        parseInt(result[4], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ];
  }

  throw new Error();
}
