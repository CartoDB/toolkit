/* eslint-disable @typescript-eslint/no-explicit-any */

const NULL_COLOR = '#ccc';
const OTHERS_COLOR = '#777';
const NULL_SIZE = 0;
const STROKE_WIDTH = 0.5;
const STROKE_COLOR = '#22222288';

export const defaultStyles: any = {
  Point: {
    color: '#EE4D5A',
    size: 10,
    opacity: 1,
    strokeColor: STROKE_COLOR,
    strokeWidth: STROKE_WIDTH,
    nullColor: NULL_COLOR,
    othersColor: OTHERS_COLOR,
    sizeRange: [2, 14],
    nullSize: NULL_SIZE
  },
  Line: {
    color: '#4CC8A3',
    size: 1,
    opacity: 1,
    nullColor: NULL_COLOR,
    othersColor: OTHERS_COLOR,
    sizeRange: [1, 10],
    nullSize: NULL_SIZE
  },
  Polygon: {
    color: '#826DBA',
    opacity: 0.7,
    strokeColor: STROKE_COLOR,
    strokeWidth: STROKE_WIDTH,
    nullColor: NULL_COLOR,
    othersColor: OTHERS_COLOR
  }
};
