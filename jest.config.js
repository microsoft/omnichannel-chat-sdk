module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns : [
    "<rootDir>/samples/",
    "<rootDir>/playwright/"
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
    '^axios$': require.resolve('axios'),
  },
  setupFiles: ["./jestSetup.js"]
};