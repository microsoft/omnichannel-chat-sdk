import { test, expect } from '@playwright/test';
import {join} from 'path';

const testPage = join('file:', __dirname, '..', 'public', 'index.html');

test('index.html should be loaded properly', async ({ page }) => {
  await page.goto(testPage);
  const message = 'page loaded';
  const [msg] = await Promise.all([
      page.waitForEvent('console'),
      await page.evaluate((message) => {
          console.log(message);
      }, message)
  ]);

  for (const arg of msg.args()) {
      const value = await arg.jsonValue();
      console.log(value);
      expect(value).toEqual(message);
  }
});