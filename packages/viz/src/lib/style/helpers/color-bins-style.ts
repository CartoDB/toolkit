import {
  getColors,
  getUpdateTriggers,
  hexToRgb,
  validateParameters
} from './utils';

import { Source } from '../../sources/Source';
import { ClassificationMethod, Classifier } from '../Classifier';

export function colorBinsStyle(
  featureProperty: string,
  options?: ColorBinsStyleOptions
) {
  const opts = { ...defaultOptions, ...options };

  validateBinParameters(featureProperty, opts.breaks, opts.palette);

  if (opts.breaks.length) {
    return calculateWithBreaks(featureProperty, opts.breaks, opts);
  }

  return async (source: Source) => {
    const stats = await source.getFieldStats(featureProperty);
    const classifier = new Classifier(stats);
    const breaks = classifier.classify(opts.bins, opts.method);
    return calculateWithBreaks(featureProperty, breaks, opts);
  };
}

function calculateWithBreaks(
  featureProperty: string,
  breaks: number[],
  options: ColorBinsStyleOptions
) {
  // Number.MIN_SAFE_INTEGER is here to make closed intervals,
  // that way last range comparison will never be true
  const ranges = [...breaks, Number.MAX_SAFE_INTEGER];

  const {
    rgbaColors,
    othersColor: rgbaOthersColor = hexToRgb(options.othersColor)
  } = getColors(options.palette, ranges.length);

  const rgbaNullColor = hexToRgb(options.nullColor);

  const getFillColor = (feature: Record<string, any>) => {
    const featureValue: number = feature.properties[featureProperty];

    if (!featureValue) {
      return rgbaNullColor;
    }

    // If we want to add various comparisons (<, >, <=, <=) like in TurboCARTO
    // we can change comparison within the arrow function to a comparison fn
    const rangeComparison = (
      definedValue: number,
      currentIndex: number,
      valuesArray: number[]
    ) =>
      featureValue < definedValue &&
      (currentIndex === 0 || featureValue >= valuesArray[currentIndex - 1]);

    const featureValueIndex = ranges.findIndex(rangeComparison);
    return rgbaColors[featureValueIndex] || rgbaOthersColor;
  };

  return {
    getFillColor,
    updateTriggers: getUpdateTriggers({ getFillColor })
  };
}

function validateBinParameters(
  featureProperty: string,
  values: number[] | string[],
  palette: string[] | string
) {
  const comparison = () => values.length !== palette.length - 1;
  return validateParameters(featureProperty, palette, comparison);
}

interface ColorBinsStyleOptions {
  bins: number;
  method: ClassificationMethod;
  breaks: number[];
  palette: string[] | string;
  size: number;
  opacity: number;
  strokeColor: string;
  strokeWidth: number;
  nullColor: string;
  othersColor: string;
}

const defaultOptions: ColorBinsStyleOptions = {
  bins: 5,
  method: 'quantiles',
  breaks: [],
  palette: 'purpor',
  size: 10,
  opacity: 1,
  strokeColor: '#222',
  strokeWidth: 1,
  nullColor: '#00000000',
  othersColor: '#00000000'
};
