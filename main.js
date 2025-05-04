/* 
* ⚠️ DISCLAIMER:
 * - This tool is for educational and personal portfolio use only.
 * - It is NOT affiliated with Tesla or endorsed in any way.
 * - It does NOT perform automated logins or bypass any access controls.
 * - All logic is based on publicly accessible website content and manual user login.
 *
 * 📦 Created for ReactShopBot — a demonstration project.
 */


const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TARGET_PRODUCT_URL = 'https://www.tesla.com/tr_TR/modely';
const cookiesPath = path.resolve(__dirname, 'cookies/storage.json');
const CHECK_INTERVAL = 20000;

console.log(`🔍 Checking login file: ${cookiesPath}`);

if (!fs.existsSync(cookiesPath)) {
  console.error('❌ No login session found. Please run scripts/login.js before starting this bot.');
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    storageState: cookiesPath,
  });

  const page = await context.newPage();

  const checkAvailability = async (page) => {
    try {
      console.log(`🔄 Checking at ${new Date().toLocaleTimeString()}...`);
      await page.goto(TARGET_PRODUCT_URL, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

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

  await checkAvailability(page);
  const loop = setInterval(() => checkAvailability(page), CHECK_INTERVAL);
})();
