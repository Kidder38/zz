/**
 * Pomocný modul pro detekci cesty k nainstalovanému Chrome nebo Chromium
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

/**
 * Detekuje a vrátí cestu k nainstalovanému Chrome nebo Chromium
 * @returns {Promise<string>} - Cesta k Chrome
 */
async function findChrome() {
  const platform = process.platform;

  // Možné cesty k Chrome pro macOS
  const macOSPaths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  ];

  // Možné cesty k Chrome pro Windows
  const windowsPaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
    process.env.PROGRAMFILES + '\\Google\\Chrome\\Application\\chrome.exe',
    process.env['PROGRAMFILES(X86)'] + '\\Google\\Chrome\\Application\\chrome.exe',
  ];

  // Možné cesty k Chrome pro Linux
  const linuxPaths = [
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
  ];

  let chromePaths = [];

  // Výběr cest podle platformy
  if (platform === 'darwin') {
    chromePaths = macOSPaths;
  } else if (platform === 'win32') {
    chromePaths = windowsPaths;
  } else if (platform === 'linux') {
    chromePaths = linuxPaths;
  }

  // Kontrola existujících cest
  for (const chromePath of chromePaths) {
    try {
      if (fs.existsSync(chromePath)) {
        console.log(`Chrome nalezen na: ${chromePath}`);
        return chromePath;
      }
    } catch (error) {
      console.error(`Chyba při kontrole cesty ${chromePath}:`, error);
    }
  }

  // Pokud nebyla nalezena žádná z výchozích cest, zkusíme detekovat cestu příkazem
  try {
    if (platform === 'darwin') {
      // Pro macOS zkusíme cestu přes mdfind
      const mdFindResult = execSync('mdfind "kMDItemCFBundleIdentifier == com.google.Chrome"').toString().trim();
      if (mdFindResult) {
        const chromePath = path.join(mdFindResult.split('\n')[0], 'Contents', 'MacOS', 'Google Chrome');
        if (fs.existsSync(chromePath)) {
          console.log(`Chrome nalezen pomocí mdfind na: ${chromePath}`);
          return chromePath;
        }
      }
    } else if (platform === 'linux') {
      // Pro Linux zkusíme cestu přes which
      const whichResult = execSync('which google-chrome chromium chromium-browser').toString().trim();
      if (whichResult) {
        console.log(`Chrome nalezen pomocí which na: ${whichResult.split('\n')[0]}`);
        return whichResult.split('\n')[0];
      }
    } else if (platform === 'win32') {
      // Pro Windows zkusíme cestu přes registry
      try {
        const regResult = execSync(
          'reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe" /ve',
          { encoding: 'utf-8' }
        );
        const match = regResult.match(/REG_SZ\s+(.*)$/m);
        if (match && match[1]) {
          const chromePath = match[1].trim();
          console.log(`Chrome nalezen pomocí registrů na: ${chromePath}`);
          return chromePath;
        }
      } catch (e) {
        console.warn('Nepodařilo se najít Chrome v registrech Windows');
      }
    }
  } catch (error) {
    console.error('Chyba při hledání Chrome pomocí příkazů:', error);
  }

  // Fallback - pokud nebyla nalezena žádná cesta, použijeme výchozí
  const fallbackPath = platform === 'win32' 
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : (platform === 'darwin' 
        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' 
        : '/usr/bin/google-chrome');
  
  console.warn(`Nepodařilo se detekovat Chrome, používám výchozí cestu: ${fallbackPath}`);
  return fallbackPath;
}

module.exports = { findChrome };