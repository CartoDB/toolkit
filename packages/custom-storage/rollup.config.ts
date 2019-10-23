import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

// tslint:disable-next-line:no-var-requires
const { modules, umd } = require('../../rollup-config-generator');
// tslint:disable-next-line:no-var-requires
const pkg = require('./package.json');

export default [
  umd('CartoToolkitCustomStorage', 'src/index.ts', pkg, [
    typescript({ useTsconfigDeclarationDir: true }),
    resolve(),
    commonjs(),
    terser()
  ]),
  modules('src/index.ts', pkg, [
    typescript({ useTsconfigDeclarationDir: true }),
    terser()
  ], Object.keys(pkg.dependencies || {}))
];
