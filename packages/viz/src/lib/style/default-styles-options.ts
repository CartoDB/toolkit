import { ClassificationMethod } from './Classifier';

export interface DefaultOptions {
  // Size of point or line features.
  size: number;
  // Opacity value. Default is 1 for points and lines and 0.9 for polygons.
  opacity: number | { [geomType: string]: number };
  // Color of the stroke. Default is '#222'.
  strokeColor: string;
  // Size of the stroke
  strokeWidth: number;
  // Palette that can be a named cartocolor palette or other valid color palette.
  palette: string[] | string;
  // Color applied to features which the attribute value is null.
  nullColor: string;
  // Color applied to features which the attribute value is not in the breaks.
  othersColor: string;
  // Size applied to features which the attribute value is null. Default 0
  nullSize: number;
}

interface BinsStyleOptions extends DefaultOptions {
  // Number of size classes (bins) for map. Default is 5.
  bins: number;
  // Classification method of data: "quantiles", "equal", "stdev". Default is "quantiles".
  method: ClassificationMethod;
  // Assign manual class break values.
  breaks: number[];
}

export type ColorBinsStyleOptions = BinsStyleOptions;

export interface SizeBinsStyleOptions extends BinsStyleOptions {
  // Min/max size array as a string. Default is [2, 14] for point geometries and [1, 10] for lines.
  sizeRange: number[];
  // Size applied to features which the attribute value is null. Default 0
  nullSize: number;
}

interface CategoriesStyleOptions extends DefaultOptions {
  // Number of categories. Default is 11. Values can range from 1 to 16.
  top: number;
  // Category list. Must be a valid list of categories.
  categories: string[];
}

export type ColorCategoriesStyleOptions = CategoriesStyleOptions;

export interface SizeCategoriesStyleOptions extends CategoriesStyleOptions {
  // Min/max size array as a string. Default is [2, 14] for point geometries and [1, 10] for lines.
  sizeRange: number[];
}

export const defaultOptions: DefaultOptions = {
  size: 2,
  opacity: { Point: 1, Line: 0.9, Polygons: 0.9 },
  strokeColor: '#222',
  strokeWidth: 1,
  palette: 'teal',
  nullColor: '#333',
  // Color applied to features which the attribute value is not in the breaks.
  othersColor: '#777',
  // Size applied to features which the attribute value is null. Default 0
  nullSize: 0
};

const defaultBinsStyleOptions: BinsStyleOptions = {
  ...defaultOptions,
  bins: 5,
  method: 'equal',
  breaks: []
};

export const defaultColorBinsStyleOptions: ColorBinsStyleOptions = defaultBinsStyleOptions;

export const defaultSizeBinsStyleOptions: SizeBinsStyleOptions = {
  ...defaultBinsStyleOptions,
  sizeRange: [2, 14]
};

const defaultCategoriesStyleOptions: CategoriesStyleOptions = {
  ...defaultOptions,
  // Number of categories. Default is 11. Values can range from 1 to 16.
  top: 11,
  // Category list. Must be a valid list of categories.
  categories: []
};

export const defaultColorCategoriesStyleOptions: ColorCategoriesStyleOptions = defaultCategoriesStyleOptions;

export const defaultSizeCategoriesStyleOptions: SizeCategoriesStyleOptions = {
  ...defaultCategoriesStyleOptions,
  sizeRange: [2, 14]
};
