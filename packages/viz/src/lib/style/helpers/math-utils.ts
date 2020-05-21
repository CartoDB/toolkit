const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;
const clamp = (a: number, min = 0, max = 1) => Math.min(max, Math.max(min, a));

export const invlerp = (x: number, y: number, a: number) =>
  clamp((a - x) / (y - x));

/**
 * Calculate a linear interpolation between two ranges, it converts a value from one data range to another
 * @param x1 start data range 1
 * @param y1 finish data range 1
 * @param x2 start data range 2
 * @param y2 finish data range 2
 * @param value
 */

export const range = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  value: number
) => lerp(x2, y2, invlerp(x1, y1, value));
