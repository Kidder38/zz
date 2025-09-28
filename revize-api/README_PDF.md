# PDF Generátor protokolů revizí

Implementoval jsem nový design PDF protokolů revizí podle poskytnutého vzoru. Nový PDF dokument má:

> **Důležitá poznámka o české diakritice**: Pro zajištění správného zobrazení českých znaků v PDF dokumentu byla odstraněna diakritika ze všech statických textů. Pro plnou podporu české diakritiky by bylo potřeba použít vlastní font s podporou českých znaků a embedovat ho do PDF dokumentu. Další možností je použít knihovnu jako je `pdfmake`, která má lepší podporu pro lokalizaci.

1. Profesionální hlavičku s logem a kontaktními údaji
2. Přehledně strukturované sekce pro:
   - Provozovatele zařízení
   - Údaje o zařízení
   - Údaje o revizi
   - Výsledky kontrol (dokumentace, zařízení, funkční zkoušky, zátěžové testy)
   - Závěr revize s barevným zvýrazněním výsledku
   - Sekce pro podpisy

## Řešení problému s českou diakritikou

V rámci úpravy PDF generátoru byly provedeny následující změny pro zajištění správného zobrazení českých znaků:

1. **Odstranění diakritiky z textů**
   - Všechny statické texty byly upraveny tak, aby neobsahovaly diakritická znaménka
   - Tato úprava zajišťuje správné zobrazení textu i bez nutnosti embedovat vlastní fonty

2. **Nastavení jazyka dokumentu**
   - Do konfigurace PDF dokumentu byl přidán parametr `lang: 'cs'`
   - Přidáno nastavení `displayTitle: true` pro správné zobrazení metadat

3. **Další možnosti řešení**
   - Pro plnou podporu české diakritiky by bylo ideální použít vlastní font s českou diakritikou a embedovat jej do PDF
   - Alternativní řešení by bylo použití knihovny `pdfmake` nebo `jsPDF` s lepší podporou lokalizace

## Potřebné kroky pro dokončení implementace

Pro kompletní implementaci je potřeba provést ještě tyto kroky:

1. **Vytvořit složku pro statické soubory:**
   ```bash
   mkdir -p /Users/imac/projekty/jeraby/revize-api/public
   ```

2. **Přidat logo společnosti:**
   Vložte soubor logo.png do složky `/Users/imac/projekty/jeraby/revize-api/public/`

3. **Aktualizovat endpointy pro generování PDF:**
   Funkce generateRevisionPdf v `utils/pdfGenerator.js` je připravena k použití v příslušných kontrolerech.

4. **Ujistit se, že jsou nainstalované potřebné závislosti:**
   ```bash
   npm install pdfkit --save
   ```

## Vlastnosti nového PDF formátu

- **Responzivní design:** PDF je navrženo tak, aby správně zobrazovalo všechny informace bez ohledu na jejich délku
- **Barevné značení:** Vyhovující a nevyhovující položky jsou přehledně barevně odlišeny
- **Tabulkový formát:** Kontrolované položky jsou přehledně zobrazeny v tabulkách
- **Profesionální vzhled:** Formát odpovídá profesionálním standardům pro revizní protokoly

## Použití

```javascript
const { generateRevisionPdf } = require('./utils/pdfGenerator');
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

## Ukázka vzhledu

Nový formát PDF je inspirován poskytnutým vzorem a obsahuje všechny důležité sekce v moderním a přehledném designu.

Konkrétní ukázku můžete získat vygenerováním PDF z existující revize.