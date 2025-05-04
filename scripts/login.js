const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false }); // show browser
  const context = await browser.newContext();

  const page = await context.newPage();
  await page.goto('https://www.tesla.com/tr_TR');

  console.log('🟢 Please log in manually. I will save your session after 60 seconds...');

  // Give user time to log in
  await page.waitForTimeout(60000); // 60 seconds

  // Save session to file
  const storage = await context.storageState();
  const cookiesPath = path.resolve(__dirname, '../cookies/storage.json');
  fs.writeFileSync(cookiesPath, JSON.stringify(storage, null, 2));

  console.log('✅ Session saved to cookies/storage.json');
  await browser.close();
})();
