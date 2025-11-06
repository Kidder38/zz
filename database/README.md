# Databáze - Revizní systém jeřábů

## Obsah adresáře

### Strukturální soubory
- `complete_database_dump.sql` - Kompletní dump databáze (struktura + data)
- `database_dump.sql` - Pouze data z databáze

### Migrace
Migrace jsou uložené v následujících adresářích:
- `../revize-api/db/` - Hlavní migrace pro API
- `../revize-app/migrations/` - Dodatečné migrace pro aplikaci

## Instalace databáze

### 1. Vytvoření databáze
```sql
CREATE DATABASE revize_db;
```

### 2. Import kompletní databáze
```bash
psql -h localhost -U postgres -d revize_db < complete_database_dump.sql
```

### 3. Nebo postupná instalace
1. Nejdřív spusťte základní schéma:
```bash
psql -h localhost -U postgres -d revize_db < ../revize-api/db/schema.sql
```

2. Poté importujte data:
```bash
psql -h localhost -U postgres -d revize_db < database_dump.sql
```

## Struktura databáze

### Hlavní tabulky
- `customers` - Zákazníci
- `equipment` - Zařízení/jeřáby
- `revisions` - Revize
- `projects` - Projekty/stavby
- `equipment_locations` - Historie lokací zařízení
- `logbook_entries` - Záznamy z deníku
- `users` - Uživatelé systému

### Podpůrné tabulky
- `checklist_templates` - Šablony kontrol
- `checklist_template_items` - Položky kontrolních listů
- `defects` - Evidence závad
- `equipment_files` - Soubory k zařízením

## Testovací data

Databáze obsahuje testovací data pro:
- 3 zákazníky (Strabag, Skanska, Metrostav)
- 5 jeřábů různých typů
- Ukázkové projekty a lokace
- Kontrolní šablony podle českých norem
- Vzorové revizní záznamy

## Poznámky

- Databáze je optimalizovaná pro PostgreSQL 14+
- Všechna hesla v testovacích datech jsou hashovaná
- Datum exportu: $(date)