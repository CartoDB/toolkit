// Webpack uses this to work with directories
const path = require('path');

// This is main configuration object.
// Here you write different options and tell Webpack what to do
module.exports = {

  // Path to your entry point. From this file Webpack will begin his work
  entry: './src/index.ts',

  // Path and filename of your result bundle.
  // Webpack will bundle all JavaScript into this file
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'viz.umd.js',
    library: 'carto',
    libraryTarget: 'umd'
  },

  externals: {
    '@luma.gl/core': {
      amd: '@luma.gl/core',
      root: 'luma',
      commonjs: '@luma.gl/core',
      commonjs2: '@luma.gl/core'
    },
    '@deck.gl/core': {
      amd: '@deck.gl/core',
      root: 'deck',
      commonjs: '@deck.gl/core',
      commonjs2: '@deck.gl/core'
    }
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },

  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },

  // Default mode for Webpack is production.
  // Depending on mode Webpack will apply different things
  // on final bundle. For now we don't need production's JavaScript
  // minifying and other thing so let's set mode to development
  mode: 'development'
};
