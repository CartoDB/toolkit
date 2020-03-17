import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

// tslint:disable-next-line:no-var-requires
const { modules, umd } = require('../../rollup-config-generator');
// tslint:disable-next-line:no-var-requires
const pkg = require('./package.json');

const fileNames = {
  browser: 'dist/sql.umd.js',
  main: pkg.main,
  module: pkg.module
};

export default (commandLineArgs) => {
  let minifyPlugins = [];
  if (!commandLineArgs.configDebug) {
    minifyPlugins = [terser()];
  }

  return [
    umd('CartoToolkitSQL', 'src/index.ts', fileNames, [
      typescript({ useTsconfigDeclarationDir: true }),
      resolve(),
      commonjs(),
      ...minifyPlugins
    ]),
    modules('src/index.ts', fileNames, [
      typescript({ useTsconfigDeclarationDir: true }),
      ...minifyPlugins
    ], Object.keys(pkg.dependencies || {}))
  ];
};

