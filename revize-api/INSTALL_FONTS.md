# Instalace fontů pro správné zobrazení češtiny v PDF

Pro správné zobrazení českých znaků v PDF je nutné nainstalovat fonty Arial MT s podporou CP1250 kódování.

## Kroky instalace:

1. Vytvořte složku `fonts` v kořenovém adresáři projektu:
   ```
   mkdir -p /Users/imac/projekty/jeraby/revize-api/fonts
   ```

2. Stáhněte standardní Arial fonty s podporou středoevropských znaků (CP1250):
   - ArialMT (Regular): https://www.fontpalace.com/font-download/arial/
   - ArialMT Bold: https://www.fontpalace.com/font-download/arial+bold/

3. Umístěte fonty do složky `/fonts`:
   - `/fonts/arialmt.ttf`
   - `/fonts/arialmtbold.ttf`

4. V případě problémů s přístupem k fontům, ujistěte se, že složka `/fonts` má správná přístupová práva:
   ```
   chmod 755 /Users/imac/projekty/jeraby/revize-api/fonts
   chmod 644 /Users/imac/projekty/jeraby/revize-api/fonts/*.ttf
   ```

## Alternativní řešení

Pokud by výše uvedené řešení nefungovalo, je možné použít jednu z následujících alternativ:

1. **Minimální PDF generátor s Helvetica (doporučeno pro okamžité řešení)**
   - Nastavte v souboru `controllers/revisionController.js` import na `pdfGeneratorMinimal.js`:
   ```javascript
   const { generateRevisionPdf } = require('../utils/pdfGeneratorMinimal');
   ```
   - Tento generátor používá základní vestavěné fonty PDF bez potřeby instalace externích fontů
   - Generuje jednodušší verzi PDF dokumentu, ale vždy funguje
   - Používá pouze ASCII znaky

2. **Základní PDF generátor bez diakritiky**
   - Nastavte v souboru `controllers/revisionController.js` import na `pdfGenerator3.js`
   - Tento generátor nahrazuje české znaky jejich ASCII variantami (a místo á, apod.)

3. **Distribuujte české fonty s aplikací**
   - Stáhněte a distribuujte české fonty jako součást aplikace
   - Upravte cestu k fontům v souboru `pdfGeneratorCP1250.js`

## Testování

Pro ověření správné funkčnosti generování PDF s českými znaky můžete použít:

1. Přejděte na detail konkrétní revize
2. Klikněte na tlačítko "Generovat PDF"
3. Zkontrolujte, zda se české znaky v PDF správně zobrazují

V případě problémů kontrolujte konzoli Node.js, kde se mohou objevit chyby při načítání fontů nebo generování PDF souboru.