# Zadání projektu: Aplikace pro správu revizí zdvihacích zařízení

## Cíl projektu
Vyvinout webovou aplikaci pro evidenci, správu a sledování zdvihacích zařízení (zejména věžových jeřábů), jejich revizí, servisních výjezdů a inspekcí. Aplikace umožní přehlednou správu zákazníků, jejich zařízení a kompletní evidenci prováděných prací včetně generování revizních protokolů.

## Základní požadavky

### 1. Správa zákazníků
- Evidence firem a jejich kontaktních údajů
- Přehled všech zařízení patřících zákazníkovi
- Historie revizí a servisních úkonů pro každého zákazníka
- Možnost vyhledávání a filtrování zákazníků

### 2. Evidence zdvihacích zařízení
- Ukládání technických parametrů zařízení dle přiloženého vzoru dokumentu:
  - Typ zařízení
  - Výrobce
  - Rok výroby
  - Výrobní číslo
  - Inventární/evidenční číslo
  - Vyložení min./max.
  - Nosnost zdvihu
  - Výška zdvihu
  - Zařazení jeřábu dle normy
- Propojení s konkrétním zákazníkem
- Evidence historie revizí a servisních zásahů u každého zařízení
- Upozornění na blížící se termíny revizí

### 3. Správa revizí
- Vytváření nových revizních protokolů podle vzoru dokumentu
- Evidence všech částí revizního protokolu:
  - Kontrola technické dokumentace (část A)
  - Prohlídka zařízení (část B)
  - Funkční zkouška (část C)
  - Zkoušky se zatížením (část D)
  - Použitá měřidla (část E)
  - Závěr revize (část F)
- Generování PDF protokolů na základě šablony
- Ukládání a správa revizních dokumentů

### 4. Správa servisních výjezdů
- Evidence provedených servisních prací
- Zaznamenávání:
  - Data návštěvy
  - Odpracovaných hodin
  - Popisu provedených prací
  - Použitých dílů
  - Nákladů
- Sledování fakturace zákazníkům
- Přehled všech servisních zásahů

### 5. Správa inspekcí
- Evidence pravidelných inspekcí
- Zaznamenávání zjištěných nedostatků a doporučení
- Plánování následných kontrol

## Technické požadavky

### Frontend
- Použití technologie React
- Responzivní design pomocí Tailwind CSS
- Intuitivní uživatelské rozhraní
- Formuláře pro zadávání a úpravu dat

### Backend
- Node.js s Express.js
- REST API pro komunikaci s frontendem
- Zabezpečení API

### Databáze
- PostgreSQL pro ukládání všech dat
- Relační struktura databáze

## Plán vývoje

### Fáze 1: Návrh a příprava
- Návrh databázové struktury
- Nastavení vývojového prostředí
- Vytvoření základních projektů pro frontend a backend

### Fáze 2: Implementace základních funkcí
- Vytvoření CRUD operací pro zákazníky
- Vytvoření CRUD operací pro zařízení
- Implementace základního uživatelského rozhraní

### Fáze 3: Implementace funkcí pro revize a servis
- Vytvoření formulářů pro zadávání revizí podle vzoru dokumentu
- Implementace generování PDF dokumentů
- Vytvoření systému pro evidenci servisních výjezdů

### Fáze 4: Rozšíření a testování
- Implementace notifikací pro blížící se revize
- Vytvoření analytických přehledů
- Testování a opravy chyb

### Fáze 5: Nasazení a dokumentace
- Nasazení aplikace na server
- Vytvoření uživatelské dokumentace
- Zaškolení uživatelů

## Požadavky na formát revizních protokolů
- Protokoly budou vytvářeny podle přiloženého vzoru
- Možnost úpravy vzhledu protokolů
- Export do PDF formátu

## Uživatelské role
- Administrátor (plný přístup)
- Technik (správa revizí a servisu)
- Zákazník (náhled na vlastní zařízení a revize)
