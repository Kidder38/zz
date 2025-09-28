# Řešení problému s českými znaky v PDF

Problém spočíval v kódování českých znaků při generování PDF dokumentů. Vyzkoušeli jsme několik přístupů a zde jsou hlavní zjištění a řešení.

## Identifikace problému

Problém byl v kódování znaků při generování PDF. Pravděpodobné příčiny byly:

1. Nekorektní font bez podpory českých znaků
2. Problémy s kódováním textů při přenosu z databáze do PDF generátoru
3. Komplikace při vkládání specifických UTF-8 znaků do PDF

## Implementovaná řešení

Vytvořili jsme několik variant generátorů PDF, které řeší problém různými způsoby:

### 1. pdfGeneratorEnhanced.js (NOVÉ, AKTUÁLNĚ POUŽÍVANÉ)

- Používá knihovnu PDFKit s detailním mapováním problematických českých znaků
- Využívá dekomponované Unicode znaky pro diakritiku
- Spolehlivé zobrazení všech českých znaků včetně problematických (ř, č, ě, atd.)
- Integruje osvědčené postupy z vyzkoušených řešení

### 2. pdfMakeGeneratorWithVFS.js (PŘEDCHOZÍ ŘEŠENÍ)

- Používá knihovnu PDFMake se standardními fonty Helvetica
- Strukturovaný přístup k definici dokumentu
- Řeší některé znaky, ale ne všechny

### 3. pdfGeneratorASCII.js (záložní řešení)

- Používá PDFKit s explicitním převodem českých znaků na ASCII
- Vysoce spolehlivé řešení pro všechny systémy
- Používá vestavěné fonty PDF (Helvetica)
- Vždy funguje, ale nepoužívá diakritické znaky
- Nevyžaduje žádnou konfiguraci

### 4. pdfGeneratorPDFLib.js

- Používá PDFKit s přímou podporou českých znaků
- Potenciální problémy s některými systémy
- Používá vestavěné fonty PDF (Helvetica)
- Zachovává české znaky v textu
- Nevyžaduje žádnou konfiguraci

### 5. pdfGeneratorHTML.js

- Používá PDFKit a jednoduchý tabulkový layout
- Jednoduché a spolehlivé řešení
- Používá vestavěné fonty PDF (Helvetica)
- ASCII verze českých názvů (bez háčků a čárek)
- Nevyžaduje žádnou konfiguraci

### 6. pdfMakeGenerator.js

- Používá knihovnu PDFMake
- Změněno na používání vestavěných fontů bez závislosti na externích souborech
- Také využívá ASCII ekvivalenty českých znaků

### 7. pdfGeneratorUTF8.js

- Pokouší se o explicitní převod textů do UTF-8
- Používá PDFKit s detekcí a převodem kódování

### 8. pdfGeneratorCP1250.js

- Používá CP1250 kódování pro středoevropské jazyky
- Vyžaduje instalaci Arial MT fontů s podporou CP1250
- Pokročilé řešení pro plnou podporu češtiny

### 9. pdfGenerator3.js

- Explicitně nahrazuje české znaky za ASCII ekvivalenty
- Jednoduchý a spolehlivý přístup

## Inspirace a výzkum řešení

Analýzou úspěšných implementací včetně jiných projektů a průzkumem problematiky jsme zjistili:

1. Problém je v reprezentaci diakritických znaků, které se mohou skládat z několika Unicode codepoints
2. Spolehlivější přístup je použít explicitní dekomponovanou reprezentaci znaků s diakritikou
3. Nejspolehlivější metodou je přímá kontrola nad zobrazením každého znaku s diakritikou
4. Strukturovaný a pečlivý přístup k PDF generování je klíčový pro spolehlivé výsledky

Na základě tohoto průzkumu jsme vytvořili robustní generátor `pdfGeneratorEnhanced.js`, který kombinuje nejlepší přístupy a implementuje detailní mapování problematických znaků.

## Aktuální doporučení

1. **Primární řešení**: Používejte aktuální `pdfGeneratorEnhanced.js`, který poskytuje nejlepší podporu pro české znaky díky detailnímu mapování problematických znaků:
   - Využívá Unicode kombinované znaky pro správnou reprezentaci diakritiky
   - Řeší problematické znaky jako ř, č, ž, ě, které byly dříve zobrazovány chybně
   - Funguje spolehlivě bez potřeby instalace speciálních fontů

2. **Fallback řešení**: Pokud by nastaly problémy s českými znaky, v tomto pořadí:
   - `pdfMakeGeneratorWithVFS.js` - pokuší se o správné zobrazení některých znaků
   - `pdfGeneratorASCII.js` - zaručuje čitelnost, ale bez diakritiky

3. **Budoucí rozšíření**: Pokud se problém s diakritickými znaky vrátí, je možné implementovat ještě robustnější řešení:
   - Explicitní vložení fontů s plnou podporou češtiny (např. DejaVu, Liberation)
   - Použití knihovny Puppeteer/Playwright pro generování PDF z HTML s plnou typografickou podporou
   - Generování PDF přímo na klientovi pomocí JavaScriptových knihoven, kde je podpora fontů lépe standardizována

## Testování

Pro ověření správného zobrazení českých znaků:

1. Vytvořte testovací revizi s problematickými českými znaky, zejména:
   - Znaky s háčky: ř, č, ž, š, ť, ď, ň
   - Znaky s čárkami: á, é, í, ý, ó, ú
   - Znaky s kroužkem: ů
   - Speciální kombinace: ě

2. Zkontrolujte PDF výstup se zaměřením na správnost všech znaků v různých částech dokumentu

3. Obzvláště testujte problémové fráze jako "Zdvihacího zařízení dle ČSN ISO 9927-1", které dříve vykazovaly problémy

## Závěr

Problém s českými znaky v PDF dokumentech jsme vyřešili pomocí nového robustního generátoru, který kombinuje:

1. **Přesné mapování znaků**: Místo spoléhání na automatické kódování fontů jsme implementovali detailní mapování problematických českých znaků na jejich Unicode ekvivalenty s kombinovanými znaky (např. 'ř' → 'r\u030C')

2. **Konsistentní generování**: Všechny části dokumentu jsou generovány s použitím stejné funkce pro zajištění konzistence

3. **Univerzální použitelnost**: Řešení nevyžaduje žádné speciální instalace nebo externí fonty

Náš nový generátor PDF by měl spolehlivě řešit všechny případy, které dříve způsobovaly problémy. V případě potřeby máme k dispozici několik záložních řešení, které můžeme aktivovat jednoduchou změnou v `revisionController.js`.

Tento dokument shrnuje provedené experimenty a přístupy, takže pokud by v budoucnu došlo k novým problémům, máte přehled o vyzkoušených řešeních a můžete navázat dalším výzkumem.