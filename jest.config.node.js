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
    '^axios$': require.resolve('axios'),
    '^@azure/communication-chat$': '<rootDir>/node_modules/@microsoft/botframework-webchat-adapter-azure-communication-chat/node_modules/@azure/communication-chat',
    '^@azure/communication-signaling$': '<rootDir>/node_modules/@microsoft/botframework-webchat-adapter-azure-communication-chat/node_modules/@azure/communication-signaling',
  },
  setupFiles: ["./jest.setup.node.js"]
};