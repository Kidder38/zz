# 🚀 Rychlý start - Jak spustit aplikaci

## Co potřebuješ

1. **Node.js** (verze 16+) - [stáhnout zde](https://nodejs.org/)
2. **PostgreSQL** (verze 14+) - [stáhnout zde](https://www.postgresql.org/download/)
3. **Git** - [stáhnout zde](https://git-scm.com/)

## 📦 Krok 1: Naklonuj repozitář

```bash
git clone <url-repozitare>
cd zz
```

## 🗄️ Krok 2: Nastav databázi

### Vytvoř databázi:
```bash
# Spusť PostgreSQL klienta
psql -U postgres

# V psql konzoli:
CREATE DATABASE revize_db;
\q
```

### Naimportuj data:
```bash
# Pokud máš kompletní dump s testovacími daty:
psql -U postgres -d revize_db < database/complete_database_dump.sql

# NEBO postupně:
psql -U postgres -d revize_db < revize-api/db/schema.sql
psql -U postgres -d revize_db < revize-api/db/migration_users.sql
psql -U postgres -d revize_db < revize-api/db/migration_logbook_system.sql
# ... atd (všechny migrace)
```

## ⚙️ Krok 3: Nastav environment variables

### Backend (.env):
```bash
cd revize-api
```

Vytvoř soubor `.env`:
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=revize_db
DB_PASSWORD=postgres
DB_PORT=5432

PORT=3001
CORS_ORIGIN=http://localhost:3000

JWT_SECRET=tvuj-tajny-klic-zmenit-v-produkci
NODE_ENV=development
```

### Frontend (.env):
```bash
cd ../revize-app
```

Vytvoř soubor `.env`:
```env
REACT_APP_API_URL=http://localhost:3001/api
```

## 📥 Krok 4: Nainstaluj dependencies

```bash
# Z kořenového adresáře:
cd /path/to/zz

# Instalace
npm run install:all

# Nebo ručně:
cd revize-api && npm install
cd ../revize-app && npm install
```

## 🚀 Krok 5: Spusť aplikaci

### Varianta A - Vše najednou (doporučeno):
```bash
# Z kořenového adresáře:
npm run dev
```

Toto spustí:
- ✅ Backend API na `http://localhost:3001`
- ✅ Frontend na `http://localhost:3000`

### Varianta B - Samostatně:

**Terminál 1 - Backend:**
```bash
cd revize-api
npm run dev
```
Měl bys vidět: `Server běží na portu 3001`

**Terminál 2 - Frontend:**
```bash
cd revize-app
npm start
```
Měl bys vidět: Automaticky se otevře `http://localhost:3000`

## 🎉 Hotovo!

Aplikace běží na **http://localhost:3000**

### Přihlašovací údaje:

Pro testování můžeš vytvořit testovacího uživatele v databázi nebo použít existující (pokud byl v dumpu).

**Poznámka:** V současné době je autentizace mockovaná v `AuthContext.js`, takže můžeš použít jakékoliv jméno/heslo a vybrat si roli.

## 🔧 Během vývoje

### Když měníš kód:

**Frontend** (React):
- Změny se automaticky projeví v prohlížeči (hot reload)
- Otevři DevTools (F12) pro debugging

**Backend** (Node.js):
- Server se automaticky restartuje díky `nodemon`
- Logy vidíš v terminálu

### Užitečné příkazy:

```bash
# Kontrola běžících serverů
lsof -i :3000  # Frontend
lsof -i :3001  # Backend

# Zastavení serverů
# Ctrl+C v terminálu, kde běží

# Restart databáze (pokud potřebuješ)
psql -U postgres -d revize_db < database/complete_database_dump.sql
```

## 🐛 Řešení problémů

### Port už je používán:
```bash
# Zjisti proces na portu 3000 nebo 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Databáze se nepřipojí:
```bash
# Zkontroluj, jestli PostgreSQL běží
# macOS:
brew services list

# Linux:
sudo systemctl status postgresql

# Windows:
# Zkontroluj Services (services.msc)
```

### npm install selhává:
```bash
# Vyčisti cache
npm cache clean --force

# Smaž node_modules a zkus znovu
rm -rf node_modules package-lock.json
npm install
```

### CORS chyby:
Zkontroluj, že `CORS_ORIGIN` v backendu je `http://localhost:3000`

## 📱 Co uvidíš po spuštění

1. **Login stránka** - Můžeš se "přihlásit" s jakýmkoliv jménem (mock auth)
2. **Dashboard** - Přehled všech zařízení
3. **Navigace** podle role (admin vidí vše)
4. **Formuláře** pro vytváření revizí, zařízení, atd.

## 🎨 Struktura pro vývoj

```
revize-app/src/
├── pages/              ← Zde přidáváš nové stránky
├── components/forms/   ← Zde upravuješ formuláře
├── components/common/  ← Sdílené komponenty
├── services/           ← API volání
└── auth/              ← Autentizace a oprávnění

revize-api/
├── controllers/        ← Business logika
├── routes/            ← API endpointy
├── db/                ← Databázové migrace
└── middleware/        ← Autentizace, validace
```

## 💡 Tips pro vývoj

1. **React DevTools** - Nainstaluj si rozšíření pro prohlížeč
2. **VS Code** - Doporučený editor s těmito rozšířeními:
   - ES7+ React/Redux/React-Native snippets
   - Prettier
   - ESLint
3. **Konzole** - Vždy měj otevřenou browser console (F12)
4. **Network tab** - Pro sledování API requestů

## 🚀 Jsme ready!

Teď když měníš kód:
- Frontend: Změny vidíš ihned v prohlížeči
- Backend: Server se automaticky restartuje
- Databáze: Změny persitují

**Enjoy coding! 🎉**
