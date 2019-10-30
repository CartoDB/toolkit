import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

// tslint:disable-next-line:no-var-requires
const { modules, umd } = require('../../rollup-config-generator');
// tslint:disable-next-line:no-var-requires
const pkg = require('./package.json');

export default (commandLineArgs) => {
  let minifyPlugins = [];
  if (!commandLineArgs.configDebug) {
    minifyPlugins = [terser()];
  }

  return [
    umd('CartoToolkitSQL', 'src/index.ts', pkg, [
      typescript({ useTsconfigDeclarationDir: true }),
      resolve(),
      commonjs(),
      ...minifyPlugins
    ]),
    modules('src/index.ts', pkg, [
      typescript({ useTsconfigDeclarationDir: true }),
      ...minifyPlugins
    ], Object.keys(pkg.dependencies || {}))
  ];
};

