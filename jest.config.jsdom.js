module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    "<rootDir>/samples/",
    "<rootDir>/playwright/"
  ],
  // add matched test for all tests in the project that contains the word .web.spec.ts in the name
  testMatch: [
    "**/*.web.spec.ts"
  ],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.jsx?$": "babel-jest"
  },
  transformIgnorePatterns: [
    "/node_modules/(?!uuid)"
  ],
  coveragePathIgnorePatterns: [
    "external/aria/"
  ],
  moduleNameMapper: {
    '^axios$': require.resolve('axios')
  },
  setupFiles: ["./jest.setup.jsdom.js"]
};