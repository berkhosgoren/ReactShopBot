## 🚗 ReactShopBot

**ReactShopBot** is a lightweight automation tool that monitors any product page for availability and automatically initiates the buying process when the product becomes purchasable.

This tool is designed for **personal and educational use**, simulating the kind of auto-buy monitoring used in high-demand retail environments.

---

## 🧠 What It Does

- Opens the Tesla product page in a real browser (via Playwright) (This product used as example)
- Detects when the waitlist button (\"Güncellemeleri Al\") disappears
- Looks for real purchase CTAs like:
  - \"Sipariş Ver\" (Place Order)
  - \"Satın Al\" (Buy)
  - \"Konfigüre Et\" (Configure)
- Clicks the first valid CTA when available
- Beeps and stops the loop

---

## ⚙️ How to Use

### 1. Install Dependencies

npm install

### 2. Login via Manual Script

node scripts/login.js

This will:
- Delete any old login session
- Open Tesla’s homepage
- Let you manually log in and accept cookies
- Save the session into cookies/storage.json

### 3. Start the Monitoring Bot

node main.js

This will:
- Use your saved login session
- Begin refreshing the product page every 20 seconds
- Attempt to click the BUY button when it appears

---

## 🛡️ Disclaimer

This tool is for educational and demonstration purposes only.

- \"It does not perform automated logins or bypass any access controls.\"
- \"It does not interact with Tesla’s APIs or simulate purchases.\"
- \"All interactions are done through public browser content with manual login.\"
- \"It is not affiliated with or endorsed by Tesla Inc.\"

Use responsibly.

---

## 🛠️ Built With

- Node.js
- Playwright
- JavaScript

---
