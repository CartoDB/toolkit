const camelcase = require('lodash.camelcase');

function umd (name, input, plugins) {
  return {
    input,
    output: {
      file: `dist/${name}.umd.js`,
      name: `${camelcase(name)}`,
      format: 'umd', sourcemap: true
    },
    watch: {
      clearScreen: false
    },
    plugins
  }
}

function modules (name, input, plugins, external = []) {
  return {
      input,
      external,
      watch: {
        clearScreen: false
      },
      output: [
        { file: `dist/${name}.cjs.js`, format: 'cjs', sourcemap: true },
        { file: `dist/${name}.esm.js`, format: 'es', sourcemap: true }
      ],
      plugins
  }
}

module.exports = {
  umd,
  modules
};
