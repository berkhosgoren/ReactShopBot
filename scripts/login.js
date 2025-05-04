/**
 * 🔐 Tesla Login Capturer (Manual Session Generator)
 *
 * This script opens Tesla's public site and allows the user to manually log in.
 * Once logged in and cookies accepted, it saves the session into storage.json for use in the checker script.
 *
 * ⚠️ DISCLAIMER:
 * - This tool does not automate any login or authentication process.
 * - The login is done manually by the user.
 * - This tool is for personal/portfolio use only and is NOT affiliated with Tesla.
 * - It stores cookies locally for temporary session reuse.
 */


const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const cookiesPath = path.resolve(__dirname, '../cookies/storage.json');

// Step 1: Always delete any old session
if (fs.existsSync(cookiesPath)) {
  console.log('🧹 Removing old session...');
  fs.unlinkSync(cookiesPath);
} else {
  console.log('ℹ️ No existing session file found. Starting fresh.');
}

// Step 2: Start browser for manual login
(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🌐 Opening Tesla login page...');
  await page.goto('https://www.tesla.com/tr_TR');

  console.log('🕐 You have 60 seconds to log in and accept cookies...');
  await page.waitForTimeout(60000);

  console.log('💾 Saving session...');
  await context.storageState({ path: cookiesPath });

  await browser.close();
  console.log('✅ Session saved. You can now run main.js');
})();
