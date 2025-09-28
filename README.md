# Aplikace pro správu revizí zdvihacích zařízení

Webová aplikace pro evidenci, správu a sledování zdvihacích zařízení (zejména věžových jeřábů), jejich revizí, servisních výjezdů a inspekcí.

## Struktura projektu

Projekt je rozdělen na dvě hlavní části:

- **revize-app** - Frontend aplikace v React
- **revize-api** - Backend API v Node.js (Express)

### Frontend (revize-app)

Frontend je single-page aplikace (SPA) implementovaná v React s využitím React Router pro navigaci, Formik a Yup pro formuláře a validaci, a Tailwind CSS pro stylování.

### Backend (revize-api)

Backend je implementován jako RESTful API s využitím Node.js a Express.js, ukládá data do PostgreSQL databáze.

## Klíčové funkce

- Správa zákazníků (firem a jejich kontaktních údajů)
- Evidence zdvihacích zařízení
- Správa a generování revizních protokolů
- Evidence servisních výjezdů a prací
- Sledování inspekcí a jejich doporučení
- Generování PDF dokumentů

## Instalace a spuštění

### Požadavky

- Node.js a npm
- PostgreSQL databáze

### Instalace a spuštění frontendu

```bash
cd revize-app
npm install
npm start
```

Aplikace bude dostupná na adrese http://localhost:3000

### Instalace a spuštění backendu

```bash
cd revize-api
npm install
```

#### Nastavení databáze

1. Vytvořte PostgreSQL databázi
2. Nastavte proměnné prostředí v souboru `.env` podle vzoru v `.env.example`
3. Inicializujte databázi spuštěním SQL skriptu

```bash
psql -U postgres -d revize_db -f ./db/schema.sql
```

#### Spuštění serveru

```bash
npm run dev
```

Server bude běžet na adrese http://localhost:3001

## Technologie

### Frontend
- React
- React Router
- Formik + Yup
- Tailwind CSS
- Axios
- React Query

### Backend
- Node.js
- Express.js
- PostgreSQL (pg)
- PDFKit
- JWT pro autentizaci

## Licence

Tento projekt je licencován pod [MIT licencí](LICENSE).