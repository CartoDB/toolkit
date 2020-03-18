const path = require('path');

// Path and filename of your result bundle.
// Webpack will bundle all JavaScript into this file
const webpackBaseConfig = require('../../bundle/webpack.base');

const webpackConfig = {
  ...webpackBaseConfig,
  output: {
    path: path.resolve(__dirname, 'dist/umd'),
    filename: 'index.min.js',
    library: 'cartoCustomStorage',
    libraryTarget: 'umd'
  }
};

module.exports = webpackConfig;
