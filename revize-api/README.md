# Revize API

Backend pro aplikaci na správu revizí zdvihacích zařízení.

## Struktura projektu

- `/controllers` - Kontrolery pro zpracování požadavků od klientů
- `/db` - Databázové skripty a připojení
- `/middleware` - Middleware pro Express
- `/routes` - Definice API tras
- `/utils` - Pomocné utility

## Instalace

```bash
npm install
```

## Spuštění vývojového serveru

```bash
npm run dev
```

## Produkční spuštění

```bash
npm start
```

## Nastavení databáze

1. Ujistěte se, že máte nainstalovaný PostgreSQL a běží
2. Vytvořte databázi:

```sql
CREATE DATABASE revize_db;
```

3. Spusťte základní databázové schéma:

```bash
psql -U <username> -d revize_db -f db/schema.sql
```

4. Spusťte migraci pro přidání IČ, DIČ a podporu více kontaktních osob:

```bash
psql -U <username> -d revize_db -f db/migration_add_fields.sql
```

## API dokumentace

### Zákazníci (Customers)

- `GET /api/customers` - Získat všechny zákazníky
- `GET /api/customers/:id` - Získat jednoho zákazníka
- `POST /api/customers` - Vytvořit zákazníka
- `PUT /api/customers/:id` - Aktualizovat zákazníka
- `DELETE /api/customers/:id` - Smazat zákazníka
- `GET /api/customers/:id/equipment` - Získat zařízení zákazníka

### Zařízení (Equipment)

- `GET /api/equipment` - Získat všechna zařízení
- `GET /api/equipment/:id` - Získat jedno zařízení
- `POST /api/equipment` - Vytvořit zařízení
- `PUT /api/equipment/:id` - Aktualizovat zařízení
- `DELETE /api/equipment/:id` - Smazat zařízení

### Revize (Revisions)

- `GET /api/revisions` - Získat všechny revize
- `GET /api/revisions/:id` - Získat jednu revizi
- `POST /api/revisions` - Vytvořit revizi
- `PUT /api/revisions/:id` - Aktualizovat revizi
- `DELETE /api/revisions/:id` - Smazat revizi
- `GET /api/revisions/:id/pdf` - Získat PDF verzi revize

### Servisní návštěvy (Service Visits)

- `GET /api/service-visits` - Získat všechny servisní návštěvy
- `GET /api/service-visits/:id` - Získat jednu servisní návštěvu
- `POST /api/service-visits` - Vytvořit servisní návštěvu
- `PUT /api/service-visits/:id` - Aktualizovat servisní návštěvu
- `DELETE /api/service-visits/:id` - Smazat servisní návštěvu

### Inspekce (Inspections)

- `GET /api/inspections` - Získat všechny inspekce
- `GET /api/inspections/:id` - Získat jednu inspekci
- `POST /api/inspections` - Vytvořit inspekci
- `PUT /api/inspections/:id` - Aktualizovat inspekci
- `DELETE /api/inspections/:id` - Smazat inspekci