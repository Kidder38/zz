# Instrukce k dokončení instalace PDFMake generátoru

## Aktualizace pdfMakeGenerator.js

V souboru `/Users/imac/projekty/jeraby/revize-api/utils/pdfMakeGenerator.js` byly provedeny následující úpravy:

1. **Použití vestavěných fontů místo vlastních Roboto fontů**
   - PDFMake nyní používá standardní fonty, které jsou součástí knihovny
   - Není potřeba stahovat a instalovat fonty Roboto

2. **Odstranění závislosti na logo.png**
   - Místo loga se zobrazuje text "REVIZE A INSPEKCE"
   - V produkční verzi můžete odkomentovat kód pro použití vlastního loga

## Původní instrukce (pro referenci)

### 1. Instalace balíčku pdfmake

```bash
cd /Users/imac/projekty/jeraby/revize-api
npm install pdfmake --save
```
Tento krok byl již proveden.

### 2. Restart serveru

Po těchto úpravách restartujte server, aby se změny projevily:

```bash
cd /Users/imac/projekty/jeraby/revize-api
npm restart
# nebo
node server.js
```

## Ověření funkčnosti

Pro ověření, že PDFMake generátor funguje správně, vyzkoušejte vygenerovat PDF dokumenty pro existující revize. 

## Přechod na produkční nasazení (volitelné)

Pro plnohodnotnou implementaci s vlastními fonty a logem proveďte tyto kroky:

1. **Vytvoření adresářů pro fonty**
   ```bash
   mkdir -p /Users/imac/projekty/jeraby/revize-api/fonts
   ```

2. **Stažení a přidání Roboto fontů**
   Stáhněte následující fonty a umístěte je do složky `/fonts`:
   - Roboto-Regular.ttf
   - Roboto-Bold.ttf
   - Roboto-Italic.ttf
   - Roboto-BoldItalic.ttf

3. **Přidání loga společnosti**
   Umístěte soubor s logem společnosti do složky `/public` s názvem `logo.png`.

4. **Úprava kódu pro použití vlastních fontů a loga**
   Upravte kód v `pdfMakeGenerator.js` - odkomentujte příslušné řádky kódu pro použití vlastních fontů a loga.