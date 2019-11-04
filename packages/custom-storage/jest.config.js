module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  automock: false,
  setupFiles: [
    './setupJest.ts'
  ],
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"]
};
