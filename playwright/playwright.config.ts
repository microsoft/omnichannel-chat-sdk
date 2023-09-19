import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import path from "path";
const outPutDir = path.join(".", "generated/tests");
const jUnitTestResults = path.join(outPutDir, "test-results/test-results.xml");

const config: PlaywrightTestConfig = {
  globalSetup: require.resolve('./global-setup'),
  testDir: './integrations',
  webServer: [
    {
      command: 'node ./server/app.js',
      url: 'http://localhost:8080/',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI
    },
  ],
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  outputDir: process.env.OUTPUTDIR || outPutDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: [
    ['html', {outputFolder: 'integrations-report'}],
    ["junit", { outputFile: jUnitTestResults }]
  ],
  use: {
    headless: true,
    actionTimeout: 0,
    trace: 'on-first-retry',
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    launchOptions: {
      slowMo: parseInt(process.env.PLAYWRIGHT_SLOW_MO || 1000)
    }
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //   },
    // },

    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //   },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //   },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     channel: 'msedge',
    //   },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: {
    //     channel: 'chrome',
    //   },
    // },
  ]
};

export default config;
