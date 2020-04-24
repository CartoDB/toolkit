// // TODO: Add proper module declaration;

declare module '@loaders.gl/core' {
  export function fetchFile(url: string, options:any): Promise<any>;
  export function load(url: string, options:any): any
}

declare module '@loaders.gl/mvt' {
  export const MVTLoader: any;
}
