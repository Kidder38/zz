# Jak integrovat nový PDF generátor s PDFMake do systému

Pro přepnutí z původního `pdfGenerator.js` na nový `pdfMakeGenerator.js` je potřeba upravit import v kontroleru revizí. Zde jsou přesné instrukce:

## 1. Změna importu v RevisionController.js

Otevřete soubor `/Users/imac/projekty/jeraby/revize-api/controllers/revisionController.js` a nahraďte řádek:

```javascript
const { generateRevisionPdf } = require('../utils/pdfGenerator');
```

za:

```javascript
// Původní generátor (PDFKit) - ponecháno jako záloha
// const { generateRevisionPdf } = require('../utils/pdfGenerator');

// Nový generátor (PDFMake) s lepší podporou češtiny
const { generateRevisionPdf } = require('../utils/pdfMakeGenerator');
```

## 2. Nainstalování potřebných závislostí

V adresáři projektu spusťte:

```bash
npm install pdfmake --save
```

## 3. Příprava adresářů a fontů

Vytvořte potřebné složky:

```bash
mkdir -p /Users/imac/projekty/jeraby/revize-api/fonts
mkdir -p /Users/imac/projekty/jeraby/revize-api/public
```

Stáhněte Roboto fonty a umístěte je do složky `fonts`:
- Roboto-Regular.ttf
- Roboto-Bold.ttf
- Roboto-Italic.ttf
- Roboto-BoldItalic.ttf

Fonty můžete stáhnout z Google Fonts nebo jiného spolehlivého zdroje.

## 4. Přidání loga

Přidejte logo vaší společnosti do složky `/Users/imac/projekty/jeraby/revize-api/public/` pod názvem `logo.png`.

## 5. Testování

Po integraci otestujte generování PDF pomocí vašeho endpointu:

```
GET /api/revisions/:id/pdf
```

Nový generátor by měl produkovat PDF s plnou podporou českých znaků a přesně podle poskytnutého vzoru.

## 6. Řešení potenciálních problémů

Pokud narazíte na problémy:

1. **Chybějící font:** Ujistěte se, že soubory fontů jsou správně nahrány ve složce `/fonts`
2. **Chybějící logo:** Zkontrolujte, zda je logo správně umístěno v `/public/logo.png`
3. **Problémy s diakritikou:** Zkontrolujte, zda data z databáze jsou v kódování UTF-8

## Pokud potřebujete přepnout zpět

Pokud by nastaly problémy s novým generátorem, můžete se jednoduše vrátit k původnímu odkomentováním původního importu a zakomentováním nového.