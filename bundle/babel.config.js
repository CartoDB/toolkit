const COMMON_CONFIG = {
  comments: false,
  ignore: ['./declarations']
};

const ESM_CONFIG = {
  presets: [
    ['@babel/preset-typescript'],
    [
      '@babel/env', {
        forceAllTransforms: true,
        modules: false,
        targets: { esmodules: true }
      }
    ]
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties'],
    ['@babel/transform-runtime', { useESModules: true }]
  ]
};

const COMMONJS_CONFIG = {
  presets: [
    ['@babel/preset-typescript'],
    [
      '@babel/env', {
        forceAllTransforms: true,
        modules: 'commonjs'
      }
    ]
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties'],
    ['@babel/transform-runtime']
  ]
};

const CONFIGURATIONS = {
  ESM: ESM_CONFIG,
  COMMONJS: COMMONJS_CONFIG
};

module.exports = babelApi => {
  console.log('Bundling', babelApi.env());

  // Cache Babel config by environment
  // Not needed but useful if we add more envs
  // api.cache.using(() => process.env.BABEL_ENV);

  return {
    ...COMMON_CONFIG,
    ...CONFIGURATIONS[babelApi.env()]
  };
};
