/* 
 * ⚠️ DISCLAIMER:
 * - This tool is for educational and personal portfolio use only.
 * - It is NOT affiliated with Tesla or endorsed in any way.
 * - It does NOT perform automated logins or bypass any access controls.
 * - All logic is based on publicly accessible website content and manual user login.
 *
 * 📦 Created for ReactShopBot — a demonstration project.
 */

const notifier = require('node-notifier');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// === Configuration ===
const TARGET_PRODUCT_URL = 'https://www.tesla.com/tr_TR/modely';
const cookiesPath = path.resolve(__dirname, 'cookies/storage.json');
const CHECK_INTERVAL = 15000;

// === Error Log Setup ===
function getDatedLogPath() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return path.resolve(__dirname, `logs/error-${yyyy}-${mm}-${dd}.log`);
}

function logError(message) {
  const timestamp = new Date().toISOString();
  const fullMessage = `[${timestamp}] ${message}\n`;
  const logPath = getDatedLogPath();

  if (!fs.existsSync(path.dirname(logPath))) {
    fs.mkdirSync(path.dirname(logPath));
  }

  fs.appendFileSync(logPath, fullMessage);
}

// === Startup Check ===
console.log(`🔍 Checking login file: ${cookiesPath}`);
if (!fs.existsSync(cookiesPath)) {
  const errMsg = '❌ No login session found. Please export cookies into tesla-cookies.json and rerun.';
  console.error(errMsg);
  logError(errMsg);
  process.exit(1);
}

// === Main Bot Logic ===
(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    storageState: cookiesPath,
  });

  const page = await context.newPage();

  const checkAvailability = async () => {
    try {
      console.log(`🔄 Checking at ${new Date().toLocaleTimeString()}...`);
      await page.goto(TARGET_PRODUCT_URL, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000);

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

          notifier.notify({
            title: '🚗 Tesla Bot',
            message: 'Satın Al butonu bulundu ve tıklandı!',
            sound: true
          });

          console.log('🔔 BUY button clicked. Stopping loop.');
          clearInterval(loop);
          return;
        }
      }

      console.log('❌ No valid buy buttons found.');
    } catch (err) {
      const errorMessage = `⚠️ Error during check: ${err.message}`;
      console.error(errorMessage);
      logError(errorMessage);
    }
  };

  await checkAvailability();
  const loop = setInterval(() => checkAvailability(), CHECK_INTERVAL);
})();
