import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';

// tslint:disable-next-line:no-var-requires
const { modules, umd } = require('../../rollup-config-generator');
// tslint:disable-next-line:no-var-requires
const pkg = require('./package.json');

export default [
  umd('toolkit', 'src/toolkit.ts', [
    typescript({ useTsconfigDeclarationDir: true }),
    resolve(),
    commonjs(),
    sourceMaps()
  ]),
  modules('toolkit', 'src/toolkit.ts', [
    typescript({ useTsconfigDeclarationDir: true }),
    sourceMaps()
  ],
  Object.keys(pkg.dependencies))
];
