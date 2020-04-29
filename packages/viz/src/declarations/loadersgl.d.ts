// // TODO: Add proper module declaration and remove any
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '@loaders.gl/core' {
  export function fetchFile(url: string, options: any): Promise<any>;
  export function load(url: string, loader: any, options: any): any;
}

declare module '@loaders.gl/mvt' {
  export const MVTLoader: any;
}
