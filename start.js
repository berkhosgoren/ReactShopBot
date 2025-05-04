const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const runtimeRoot = process.cwd();

const cookiesJsonPath = path.join(runtimeRoot, 'tesla-cookies.json');
const storageDirPath = path.join(runtimeRoot, 'cookies');
const storageJsonPath = path.join(storageDirPath, 'storage.json');
const mainJsPath = path.join(runtimeRoot, 'main.js');

// 1. Ensure tesla-cookies.json exists
if (!fs.existsSync(cookiesJsonPath)) {
  fs.writeFileSync(cookiesJsonPath, '[]');
  console.log('📄 Created empty tesla-cookies.json.');
  console.log('👉 Please paste your Tesla cookies into tesla-cookies.json and re-run the app.');
  process.exit(0);
}

// 2. Ensure cookies/ directory exists
if (!fs.existsSync(storageDirPath)) {
  fs.mkdirSync(storageDirPath);
}

// 3. Read and validate tesla-cookies.json
let rawCookies;
try {
  rawCookies = JSON.parse(fs.readFileSync(cookiesJsonPath, 'utf-8'));
  if (!Array.isArray(rawCookies) || rawCookies.length === 0) {
    console.error('⚠️ tesla-cookies.json is empty or invalid.');
    process.exit(1);
  }
} catch (err) {
  console.error('❌ Failed to parse tesla-cookies.json:', err.message);
  process.exit(1);
}

// 4. Convert to Playwright format
const storageState = {
  cookies: rawCookies.map(c => ({
    name: c.name,
    value: c.value,
    domain: c.domain,
    path: c.path,
    expires: c.expirationDate || -1,
    httpOnly: c.httpOnly || false,
    secure: c.secure || false,
    sameSite: (c.sameSite || 'Lax').toLowerCase() === 'strict' ? 'Strict'
            : (c.sameSite || 'Lax').toLowerCase() === 'none' ? 'None'
            : 'Lax',
  })),
  origins: [
    {
      origin: 'https://www.tesla.com',
      localStorage: [],
    },
  ],
};

// 5. Save to storage.json
try {
  fs.writeFileSync(storageJsonPath, JSON.stringify(storageState, null, 2));
  console.log('✅ Cookies injected into cookies/storage.json.');
} catch (err) {
  console.error('❌ Failed to write cookies/storage.json:', err.message);
  process.exit(1);
}

// 6. Reset tesla-cookies.json
try {
  fs.writeFileSync(cookiesJsonPath, '', 'utf-8');
  console.log('🧹 Reset tesla-cookies.json for next session.');
} catch (err) {
  console.warn('⚠️ Could not reset tesla-cookies.json:', err.message);
}

// 7. Start main.js
try {
  console.log('🚀 Starting Tesla bot...');
  execSync(`node "${mainJsPath}"`, { stdio: 'inherit' });
} catch (err) {
  console.error('❌ Bot crashed:', err.message);
}
