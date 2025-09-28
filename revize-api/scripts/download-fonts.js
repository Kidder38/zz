/**
 * Skript pro stažení a instalaci fontů Roboto pro generování PDF
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

// Vytvoření adresáře pro fonty, pokud neexistuje
const fontDir = path.join(__dirname, '../fonts');
if (!fs.existsSync(fontDir)) {
  fs.mkdirSync(fontDir, { recursive: true });
  console.log('Vytvořen adresář fonts/');
}

// Seznam fontů ke stažení
const fonts = [
  {
    name: 'Roboto-Regular.ttf',
    url: 'https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Regular.ttf',
  },
  {
    name: 'Roboto-Medium.ttf',
    url: 'https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Medium.ttf',
  },
  {
    name: 'Roboto-Italic.ttf',
    url: 'https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Italic.ttf',
  },
  {
    name: 'Roboto-MediumItalic.ttf',
    url: 'https://github.com/google/fonts/raw/main/apache/roboto/Roboto-MediumItalic.ttf',
  }
];

// Funkce pro stažení souboru
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Stažen font: ${path.basename(outputPath)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath);
      console.error(`Chyba při stahování: ${err.message}`);
      reject(err);
    });
  });
}

// Stažení všech fontů
async function downloadAllFonts() {
  try {
    console.log('Začínám stahovat fonty Roboto...');
    
    for (const font of fonts) {
      const outputPath = path.join(fontDir, font.name);
      await downloadFile(font.url, outputPath);
    }
    
    console.log('Všechny fonty byly úspěšně staženy.');
  } catch (error) {
    console.error('Došlo k chybě při stahování fontů:', error);
    process.exit(1);
  }
}

// Spuštění stahování
downloadAllFonts();