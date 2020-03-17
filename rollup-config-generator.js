const camelcase = require('lodash.camelcase');

function umd(name, input, fileNames, plugins) {
  return {
    input,
    output: {
      file: fileNames.browser,
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

function modules(input, fileNames, plugins, external = []) {
  return {
    input,
    external,
    watch: {
      clearScreen: false
    },
    output: [
      { file: fileNames.main, format: 'cjs', sourcemap: true },
      { file: fileNames.module, format: 'es', sourcemap: true }
    ],
    plugins
  }
}

module.exports = {
  umd,
  modules
};
