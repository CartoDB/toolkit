module.exports = {
  env: {
    browser: true,
    es6: true,
    "jest/globals": true
  },
  extends: [
    'airbnb-base',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'jest',
    'prettier'
  ],
  rules: {
    // Specific for fixing an error
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',

    '@typescript-eslint/no-use-before-define': 'off',
    'comma-dangle': ["error", "never"],
    'import/extensions': [2, 'never'],
    'lines-between-class-members': 'off',
    'no-underscore-dangle': 'off',
    'no-use-before-define': 'off',

    // Maybe we can enable this later
    '@typescript-eslint/explicit-function-return-type': 'off',
    'import/prefer-default-export': 'off'
  },
};
