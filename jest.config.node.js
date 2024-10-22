module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns : [
    "<rootDir>/samples/",
    "<rootDir>/playwright/"
  ],
  coveragePathIgnorePatterns: [
    "external/aria/"
  ],
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
  },
  setupFiles: ["./jest.setup.node.js"]
};