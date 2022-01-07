module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  restoreMocks: true,
  coveragePathIgnorePatterns: ['node_modules', 'src/config', 'src/server.js','src/app.js', 'tests'],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
};
