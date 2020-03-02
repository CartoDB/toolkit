import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
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
    umd('CartoToolkitViz', 'src/index.ts', pkg, [
      resolve(),
      typescript(),
      commonjs({
        namedExports: {
          's2-geometry': ['S2']
        }
      }),
      ...minifyPlugins
    ]),
    modules('src/index.ts', pkg, [
      resolve(),
      typescript(),
      commonjs({
        namedExports: {
          's2-geometry': ['S2']
        }
      }),
      ...minifyPlugins
    ])
  ];
};
