import cartoColors from 'cartocolor';
import { CartoStylingError, stylingErrorTypes } from '../../errors/styling-error';
import { Palette } from './palette';

export const palettes: Record<string, Palette> = {};

// CARTOColors
Object
  .keys(cartoColors)
  .map((name) => {
    palettes[`${name.toUpperCase()}`] = new Palette(name, cartoColors[name]);
  });

export function getColorPalette(paletteName: string, numberOfCategories: number) {
  const palette = palettes[paletteName];

  if (!palette) {
    throw new CartoStylingError(
      `Palette ${paletteName} is not found. Please check documentation.`,
      stylingErrorTypes.PALETTE_NOT_FOUND
    );
  }

  return palette.getColors(numberOfCategories);
}
