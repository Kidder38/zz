# Řešení problémů s českými znaky v PDF pomocí Puppeteer

## Implementované řešení

Pro trvalé vyřešení problémů s českými znaky v generovaných PDF dokumentech jsme implementovali nové řešení založené na knihovně Puppeteer. Toto řešení poskytuje výrazně lepší podporu pro české znaky a vyhýbá se problémům s kódováním, které se vyskytovaly v předchozích implementacích.

### Princip řešení

Nový systém generování PDF funguje na následujícím principu:

1. **HTML šablona** - Vytvořili jsme HTML šablonu s CSS stylováním, která definuje kompletní vzhled PDF dokumentu
2. **Handlebars** - Pro naplnění šablony daty používáme knihovnu Handlebars
3. **Puppeteer** - Stránka je vykreslena pomocí knihovny Puppeteer, která používá prohlížeč Chrome/Chromium
4. **Nativní podpora znaků** - Chrome má plnou podporu pro Unicode a české znaky

### Výhody oproti předchozím řešením

1. **Plná podpora českých znaků** - Chromium/Chrome má nativní podporu pro všechny české znaky, včetně problematických jako ř, ě, ů, atd.
2. **Konzistentní zobrazení** - Výsledné PDF bude vypadat stejně jako webová stránka v prohlížeči
3. **Flexibilnější stylování** - Použití HTML a CSS poskytuje více možností pro přizpůsobení vzhledu
4. **Jednodušší údržba** - Oddělení logiky a vzhledu pomocí šablon usnadňuje budoucí úpravy

## Struktura implementace

Implementace se skládá z těchto souborů:

1. **pdfPuppeteerGenerator.js** - Hlavní modul pro generování PDF pomocí Puppeteer
2. **templates/revisionTemplate.html** - HTML šablona pro PDF dokument
3. **chromeDetector.js** - Pomocný modul pro detekci nainstalovaného Chrome/Chromium

## Požadavky a závislosti

Pro správné fungování řešení je nutné:

1. **Node.js** - verze 14 nebo novější
2. **Puppeteer/Puppeteer-core** - knihovna pro ovládání headless Chrome
3. **Handlebars** - knihovna pro práci s šablonami
4. **Chrome nebo Chromium** - nainstalovaný v systému

## Jak to funguje

1. Revizní data jsou načtena z databáze
2. Data jsou zpracována a připravena pro šablonu
3. HTML šablona je naplněna daty pomocí Handlebars
4. Puppeteer spustí Chrome v headless režimu
5. Stránka je načtena do prohlížeče
6. Prohlížeč vyrenderuje stránku do PDF
7. Výsledné PDF je odesláno jako odpověď

## Jak používat

Nové řešení je již nastaveno jako výchozí v `revisionController.js`. Pro použití jiného generátoru stačí v tomto souboru zakomentovat aktuální řádek importu a odkomentovat jiný.

```javascript
// Nový generátor PDF pomocí Puppeteer - nejlepší podpora českých znaků
const { generateRevisionPdf } = require('../utils/pdfPuppeteerGenerator');

// Další možnosti (aktuálně zakomentované):
// const { generateRevisionPdf } = require('../utils/pdfGeneratorASCII');
// const { generateRevisionPdf } = require('../utils/pdfGeneratorEnhanced');
```

## Řešení problémů

Pokud by se vyskytly problémy s generováním PDF, zkontrolujte:

1. **Cesta k Chrome** - chromeDetector.js se pokouší automaticky najít cestu k Chrome, ale může selhat. V takovém případě upravte tento soubor s explicitní cestou.
2. **Chybějící fonty** - Ujistěte se, že jsou v systému nainstalovány základní fonty (Roboto, Arial, nebo podobné).
3. **Problematické znaky** - Pokud by některé znaky stále dělaly problémy, ověřte kódování v HTML šabloně (mělo by být UTF-8).

## Alternativní řešení

Pokud by toto řešení z nějakého důvodu selhalo, máme k dispozici tato alternativní řešení:

1. **pdfGeneratorEnhanced.js** - Vylepšený generátor s mapováním znaků (nejlepší z předchozích řešení)
2. **pdfGeneratorASCII.js** - Jednoduchý ASCII generátor bez diakritiky (100% spolehlivý, ale bez háčků a čárek)
3. **pdfMakeGeneratorWithVFS.js** - Řešení založené na PDFMake knihovně

## Závěr

Toto řešení by mělo trvale vyřešit problémy s českými znaky v PDF dokumentech. Díky použití moderních technologií a nativní podpory v prohlížeči Chrome je toto řešení robustní a mělo by fungovat pro všechny české znaky bez omezení.