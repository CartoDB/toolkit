/**
 * Configuration for reference, auto-generated from .ts files and their tsdoc comments
 */
module.exports = {
  // // // tsconfig: './tsconfig.json',
  exclude: ['**/node_modules/**/*.ts', '**/__tests__/**/*', '**/*.types.ts'],
  // includes: './packages/**',
  excludeExternals: true,
  // excludeNotDocumented: true,
  excludeNotExported: true,
  excludePrivate: true,
  // excludeProtected: true,
  ignoreCompilerErrors: true,
  inputFiles: './packages',
  out: './docs/api',
  mode: 'file',
  theme: 'default',
  module: 'es2015',
  target: 'es6',
  name: 'carto',
  plugin: 'none',
  listInvalidSymbolLinks: true
};
