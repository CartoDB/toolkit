import { SubPalette } from 'cartocolor';

/**
 * Color palettes.
 *
 * Palettes are constants that allow to use {@link https://carto.com/carto-colors/|CARTOColors}
 * and {@link https://github.com/axismaps/colorbrewer/|ColorBrewer} palettes easily.
 * Use them with a {@link carto.expressions.ramp|ramp}.
 *
 * The following palettes are available in the namespace {@link carto.expressions|carto.expressions}.
 *
 *  ```
 *  BURG, BURGYL, REDOR, ORYEL, PEACH, PINKYL, MINT, BLUGRN, DARKMINT, EMRLD, AG_GRNYL, BLUYL, TEAL, TEALGRN,
 *  PURP, PURPOR, SUNSET, MAGENTA, SUNSETDARK, AG_SUNSET, BRWNYL, ARMYROSE, FALL, GEYSER, TEMPS, TEALROSE, TROPIC,
 *  EARTH, ANTIQUE, BOLD, PASTEL, PRISM, SAFE, VIVID, CB_YLGN, CB_YLGNBU, CB_GNBU, CB_BUGN, CB_PUBUGN, CB_PUBU,
 *  CB_BUPU, CB_RDPU, CB_PURD, CB_ORRD, CB_YLORRD, CB_YLORBR, CB_PURPLES, CB_BLUES, CB_GREENS, CB_ORANGES, CB_REDS,
 *  CB_GREYS, CB_PUOR, CB_BRBG, CB_PRGN, CB_PIYG, CB_RDBU, CB_RDGY, CB_RDYLBU, CB_SPECTRAL, CB_RDYLGN, CB_ACCENT,
 *  CB_DARK2, CB_PAIRED, CB_PASTEL1, CB_PASTEL2, CB_SET1, CB_SET2, CB_SET3
 *  ```
 *
 * @name palettes
 * @api
 */
export class Palette {
  private name: string;
  private subPalettes: SubPalette;
  private tags: string[];

  constructor(name: string, colorPalettes: SubPalette) {
    this.name = name;
    this.tags = colorPalettes.tags || [];
    this.subPalettes = colorPalettes;
  }

  public getName() {
    return this.name;
  }

  public getColors(numberOfCategories?: number) {
    const colors = this._getBestSubPalette(numberOfCategories);

    if (this.isQualitative()) {
      const othersColor = colors.pop();
      return { colors, othersColor };
    }

    return { colors, othersColor: null };
  }

  private _getBestSubPalette(numberOfCategories?: number) {
    const {
      longestSubPaletteIndex,
      smallestSubPaletteIndex
    } = this.getSubPalettesInfo();

    let bestSubPalette;

    if (!numberOfCategories) {
      bestSubPalette = longestSubPaletteIndex;
    } else {
      const numberIsNotInteger = !Number.isInteger(numberOfCategories);
      const longestPaletteIsNotEnough =
        numberOfCategories > longestSubPaletteIndex;

      bestSubPalette = numberOfCategories;

      if (numberIsNotInteger || longestPaletteIsNotEnough) {
        bestSubPalette = longestSubPaletteIndex;
      } else if (bestSubPalette < smallestSubPaletteIndex) {
        bestSubPalette = smallestSubPaletteIndex;
      }
    }

    return [...this.subPalettes[bestSubPalette]];
  }

  private getSubPalettesInfo() {
    const subpalettesColorVariants = Object.keys(this.subPalettes)
      .filter(paletteIndex => paletteIndex !== 'tags')
      .map(Number);

    return {
      longestSubPaletteIndex: Math.max(...subpalettesColorVariants),
      smallestSubPaletteIndex: Math.min(...subpalettesColorVariants)
    };
  }

  private isQualitative() {
    return this.tags.includes('qualitative');
  }
}
