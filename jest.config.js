module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns : [
    "<rootDir>/samples/"
  ],
  coveragePathIgnorePatterns: [
    "external/aria/"
  ],
  setupFiles: ["./jestSetup.js"]
};