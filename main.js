/**
 * ⚠️ DISCLAIMER:
 * This script is for educational and portfolio purposes only.
 * It is not affiliated with or endorsed by Tesla Inc.
 * Replace the TARGET_PRODUCT_URL with any dynamic product page that becomes available over time.
 */


const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TESLA_MODEL_URL = 'https://www.tesla.com/tr_TR/modely'; // Example product page
const cookiesPath = path.resolve(__dirname, 'cookies/storage.json');
const CHECK_INTERVAL = 20000; // 20 seconds

(async () => {
  if (!fs.existsSync(cookiesPath)) {
    console.error('❌ No saved login found. Please run scripts/login.js first.');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    storageState: cookiesPath,
  });

  const page = await context.newPage();

  const checkAvailability = async () => {
    try {
      console.log(`🔄 Checking at ${new Date().toLocaleTimeString()}...`);
      await page.goto(TESLA_MODEL_URL, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000); // Let React render content

      const waitlistBtn = await page.$('text="Güncellemeleri Al"');
      if (waitlistBtn) {
        console.log('🚫 Still waitlisted (Güncellemeleri Al is present).');
        return;
      }

      console.log('🟢 Waitlist button gone — scanning CTA buttons...');

      const validBuyWords = ['sipariş', 'satın', 'konfigüre'];
      const allPrimaryButtons = await page.$$('a.tds-btn--primary, button.tds-btn--primary');

      for (const btn of allPrimaryButtons) {
        const text = await btn.textContent();
        if (text && validBuyWords.some(w => text.toLowerCase().includes(w))) {
          console.log(`✅ Found BUY CTA: "${text.trim()}". Clicking it...`);
          await btn.click();
          await page.waitForLoadState('networkidle');
          process.stdout.write('\x07');
          console.log('🔔 BUY button clicked. Stopping loop.');
          clearInterval(loop);
          return;
        }
      }

      console.log('❌ No valid buy buttons found.');
    } catch (err) {
      console.error('⚠️ Error during check:', err.message);
    }
  };

  // First run
  await checkAvailability();

  // Repeat every X seconds
  const loop = setInterval(checkAvailability, CHECK_INTERVAL);
})();
