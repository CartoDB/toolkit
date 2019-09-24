const camelcase = require('lodash.camelcase');

function umd(name, input, pkg, plugins) {
  return {
    input,
    output: {
      file: pkg.browser,
      name: `${camelcase(name)}`,
      format: 'umd',
      sourcemap: true
    },
    watch: {
      clearScreen: false
    },
    plugins
  }
}

function modules(input, pkg, plugins, external = []) {
  return {
    input,
    external,
    watch: {
      clearScreen: false
    },
    output: [
      { file: pkg.main, format: 'cjs', sourcemap: true },
      { file: pkg.module, format: 'es', sourcemap: true }
    ],
    plugins
  }
}

module.exports = {
  umd,
  modules
};
