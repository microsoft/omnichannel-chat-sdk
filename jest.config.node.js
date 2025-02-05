module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  testMatch: [
    "**/*.node.spec.ts", 
    "**/*.spec.ts",
    "!**/*.web.spec.ts"
  ],
  testPathIgnorePatterns : [
    "<rootDir>/samples/",
    "<rootDir>/playwright/"
  ],
  coveragePathIgnorePatterns: [
    "external/aria/"
  ],
  moduleNameMapper: {
    '^axios$': require.resolve('axios')
  },
  setupFiles: ["./jest.setup.node.js"]
};