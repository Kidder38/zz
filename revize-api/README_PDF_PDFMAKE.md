# PDF Generátor protokolů revizí s knihovnou PDFMake

Implementoval jsem nový generátor PDF protokolů revizí s použitím knihovny PDFMake, která má plnou podporu pro češtinu a diakritické znaky. Nový generátor vytváří profesionální protokoly podle poskytnutého vzoru.

## Hlavní výhody implementace PDFMake

1. **Plná podpora češtiny a diakritických znaků**
   - Na rozdíl od PDFKit, PDFMake bez problémů podporuje všechny české znaky
   - Není potřeba odstraňovat diakritiku ze statických textů

2. **Deklarativní přístup**
   - PDFMake používá deklarativní JSON-like strukturu pro definici dokumentu
   - Jednodušší údržba a rozšiřování dokumentu

3. **Lepší stylování**
   - Podpora stylů podobně jako v CSS
   - Možnost definovat globální styly a znovu je používat v celém dokumentu

4. **Automatické formátování**
   - Automatické řádkování a zarovnání textu
   - Dynamické tabulky s přizpůsobením šířky

## Potřebné kroky pro dokončení implementace

Pro kompletní implementaci je potřeba provést tyto kroky:

1. **Nainstalovat potřebné závislosti:**
   ```bash
   npm install pdfmake --save
   ```

2. **Vytvořit složky pro fonty a logo:**
   ```bash
   mkdir -p /Users/imac/projekty/jeraby/revize-api/fonts
   mkdir -p /Users/imac/projekty/jeraby/revize-api/public
   ```

3. **Stáhnout a přidat Roboto fonty:**
   Potřebujete tyto soubory ve složce `fonts`:
   - Roboto-Regular.ttf
   - Roboto-Bold.ttf
   - Roboto-Italic.ttf
   - Roboto-BoldItalic.ttf

   Můžete je stáhnout z Google Fonts nebo použít tento příkaz:
   ```bash
   # Nainstalovat curl pokud není nainstalovaný
   # apt-get install curl

   # Stáhnout fonty
   curl -o /Users/imac/projekty/jeraby/revize-api/fonts/Roboto-Regular.ttf https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxP.ttf
   curl -o /Users/imac/projekty/jeraby/revize-api/fonts/Roboto-Bold.ttf https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlfBBc9.ttf
   curl -o /Users/imac/projekty/jeraby/revize-api/fonts/Roboto-Italic.ttf https://fonts.gstatic.com/s/roboto/v20/KFOkCnqEu92Fr1Mu51xIIzc.ttf
   curl -o /Users/imac/projekty/jeraby/revize-api/fonts/Roboto-BoldItalic.ttf https://fonts.gstatic.com/s/roboto/v20/KFOjCnqEu92Fr1Mu51TzBic6CsE.ttf
   ```

4. **Přidat logo společnosti:**
   Vložte soubor logo.png do složky `/Users/imac/projekty/jeraby/revize-api/public/`

5. **Aktualizovat endpointy pro generování PDF:**
   Změňte import v kontroleru z původního na nový:
   ```javascript
   // Místo: const { generateRevisionPdf } = require('./utils/pdfGenerator');
   const { generateRevisionPdf } = require('./utils/pdfMakeGenerator');
   ```

## Vlastnosti nového PDF formátu

- **Profesionální vzhled:** Protokol je navržen podle poskytnutého vzoru s profesionálním rozložením
- **Plná podpora češtiny:** Všechny české znaky jsou správně zobrazeny bez nutnosti odstraňovat diakritiku
- **Responzivní obsah:** Automatické přizpůsobení obsahu prostoru (řádkování, tabulky)
- **Barevné rozlišení:** Barevné značení pro vyhovující a nevyhovující položky
- **Standardizované sekce:**
  - Hlavička s logem a kontaktními údaji
  - Údaje o provozovateli
  - Údaje o zařízení
  - Údaje o revizi
  - Výsledky kontrol v přehledných tabulkách
  - Závěr s barevným zvýrazněním
  - Sekce pro podpisy

## Použití nového generátoru

```javascript
const { generateRevisionPdf } = require('./utils/pdfMakeGenerator');
const fs = require('fs');

// V kontroleru nebo při zpracování requestu
app.get('/api/revisions/:id/pdf', async (req, res) => {
  try {
    const revisionId = req.params.id;
    
    // Získání dat z databáze
    const revision = await getRevisionById(revisionId);
    const equipment = await getEquipmentById(revision.equipment_id);
    const customer = await getCustomerById(equipment.customer_id);
    
    // Nastavení hlaviček pro download PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="revize_${revisionId}.pdf"`);
    
    // Generování PDF přímo do response
    generateRevisionPdf(revision, equipment, customer, res);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Error generating PDF' });
  }
});
```

## Řešení problémů

- **Chybějící fonty:** Pokud se zobrazuje chyba o chybějících fontech, ujistěte se, že složka `fonts` obsahuje všechny potřebné soubory a jsou správně pojmenované.
- **Neviditelné logo:** Ujistěte se, že cesta k souboru logo.png je správná a soubor existuje.
- **Problémy s diakritikou v dynamických datech:** Zkontrolujte kódování databáze a ujistěte se, že jsou data uložena v UTF-8.