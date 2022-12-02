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
  setupFiles: ["./jestSetup.js"]
};