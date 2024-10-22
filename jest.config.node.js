module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  //add matched test for all tests in the project that contains the word .node.spec.ts in the name and it doesnt contain web.spec.ts
  testMatch: [
    "**/*.node.spec.ts"
  ],
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