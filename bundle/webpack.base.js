const mode = process.env.NODE_ENV || 'development';

// This is main configuration object.
// Here you write different options and tell Webpack what to do
module.exports = {

  // Default mode for Webpack is production.
  // Depending on mode Webpack will apply different things
  // on final bundle.
  mode,

  entry: './src/index.ts',

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
    extensions: ['.tsx', '.ts', '.js'],
  }
};
