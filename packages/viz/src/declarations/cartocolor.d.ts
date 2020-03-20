declare module 'cartocolor' {
  export interface SubPalette {
    [paletteIndex: string]: string[]
  }

  const cartocolorPalettes: Record<string, Record<string, string[]>>;
  export default cartocolorPalettes;
}
