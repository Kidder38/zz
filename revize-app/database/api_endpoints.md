# API Endpoints pro Projekty/Stavby

## Přehled

Nová logika staveb vyžaduje následující API endpoints pro komunikaci mezi frontendem a databází.

## Projekty/Stavby

### `GET /api/projects`
Získat seznam všech projektů s filtry

**Query Parameters:**
```
?status=active          - filtr podle stavu
?priority=high          - filtr podle priority  
?search=praha           - vyhledávání v názvu, číslu, klientovi
?page=1&limit=50        - stránkování
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Wenceslas Square Development",
    "project_number": "WSD-2024-001",
    "client": "Praha Development s.r.o.",
    "status": "active",
    "priority": "high",
    "location": {
      "address": "Václavské náměstí, Praha 1",
      "gps_latitude": 50.0813,
      "gps_longitude": 14.4306
    },
    "start_date": "2024-01-15",
    "planned_end_date": "2024-06-30",
    "project_manager": "Ing. Pavel Stavitel",
    "site_manager": "Petr Stavební",
    "client_contact": "Jan Investor",
    "client_phone": "+420 602 111 222",
    "assigned_equipment": [
      {
        "equipment_id": 1,
        "equipment_type": "Věžový jeřáb",
        "model": "Liebherr 130 EC-B",
        "serial_number": "LH2024001",
        "assigned_date": "2024-01-15",
        "planned_removal_date": "2024-06-30",
        "status": "operational",
        "operator_id": 4,
        "operator_name": "Jan Novák"
      }
    ],
    "active_equipment_count": 1,
    "created_at": "2024-01-10T10:00:00Z"
  }
]
```

### `GET /api/projects/:id`
Získat detail konkrétního projektu

**Response:**
```json
{
  "id": 1,
  "name": "Wenceslas Square Development",
  // ... základní info jako výše
  "description": "Výstavba nového obchodního centra v centru Prahy",
  "special_requirements": "Práce pouze v pracovní dny 7:00-17:00",
  "statistics": {
    "total_equipment": 2,
    "active_equipment": 1,
    "completed_assignments": 1,
    "total_operating_hours": 206.5
  }
}
```

### `POST /api/projects`
Vytvořit nový projekt

**Request Body:**
```json
{
  "name": "Nová stavba",
  "project_number": "NS-2024-004",
  "client": "Klient s.r.o.",
  "priority": "medium",
  "location": {
    "address": "Adresa stavby",
    "gps_latitude": 50.0755,
    "gps_longitude": 14.4378
  },
  "start_date": "2024-07-01",
  "planned_end_date": "2024-12-31",
  "project_manager": "Ing. Manager",
  "site_manager": "Stavbyvedoucí",
  "client_contact": "Kontakt",
  "client_phone": "+420 123 456 789",
  "description": "Popis projektu",
  "special_requirements": "Speciální požadavky"
}
```

**Response:**
```json
{
  "id": 4,
  "status": "planned",
  "assigned_equipment": [],
  // ... ostatní data z requestu
  "created_at": "2024-01-25T10:30:00Z"
}
```

### `PUT /api/projects/:id`
Upravit existující projekt

**Request/Response:** Stejný formát jako POST

### `DELETE /api/projects/:id`
Smazat projekt (pouze pokud nemá přiřazené jeřáby)

## Přiřazování Jeřábů

### `GET /api/projects/:id/available-equipment`
Získat seznam dostupných jeřábů pro přiřazení k projektu

**Response:**
```json
[
  {
    "id": 3,
    "equipment_type": "Mobilní jeřáb",
    "manufacturer": "Demag",
    "model": "AC 40",
    "serial_number": "DM2023008",
    "current_status": "available",
    "current_location": "Hlavní sklad",
    "operating_hours": 2145.8,
    "last_revision_date": "2024-02-01",
    "availability_note": "Volný, připravený k přiřazení"
  }
]
```

### `POST /api/projects/:id/equipment`
Přiřadit jeřáb k projektu

**Request Body:**
```json
{
  "equipment_id": 3,
  "assigned_date": "2024-02-01",
  "planned_removal_date": "2024-06-30",
  "operator_id": 5,
  "operating_hours_start": 2145.8,
  "notes": "Přiřazení na hlavní fázi výstavby"
}
```

**Response:**
```json
{
  "id": 15,
  "project_id": 1,
  "equipment_id": 3,
  "assigned_date": "2024-02-01",
  "status": "assigned",
  "message": "Jeřáb byl úspěšně přiřazen ke stavbě"
}
```

### `PUT /api/projects/:id/equipment/:equipment_id/remove`
Odebrat jeřáb z projektu

**Request Body:**
```json
{
  "actual_removal_date": "2024-05-15",
  "removal_reason": "Dokončení fáze výstavby",
  "operating_hours_end": 2456.3,
  "notes": "Demontáž proběhla bez problémů"
}
```

## Historie a Statistiky

### `GET /api/equipment/:id/project-history`
Historie přiřazení jeřábu k projektům

**Response:**
```json
[
  {
    "project_id": 1,
    "project_name": "Wenceslas Square Development",
    "project_number": "WSD-2024-001",
    "assigned_date": "2024-01-15",
    "planned_removal_date": "2024-06-30",
    "actual_removal_date": null,
    "operating_hours_start": 1156.0,
    "operating_hours_end": null,
    "operator_name": "Jan Novák",
    "notes": "Montáž proběhla bez komplikací"
  }
]
```

### `GET /api/projects/:id/statistics`
Statistiky projektu

**Response:**
```json
{
  "total_equipment": 3,
  "active_equipment": 2,
  "completed_assignments": 1,
  "total_operating_hours": 450.5,
  "average_assignment_duration": "120 days"
}
```

## Chybové Stavy

### `400 Bad Request`
```json
{
  "error": "Validation failed",
  "details": {
    "name": "Název projektu je povinný",
    "start_date": "Datum začátku musí být v budoucnosti"
  }
}
```

### `409 Conflict`
```json
{
  "error": "Equipment already assigned",
  "message": "Jeřáb ID 3 je již přiřazen k jinému aktivnímu projektu",
  "conflicting_project": {
    "id": 2,
    "name": "Brno Central Plaza"
  }
}
```

### `404 Not Found`
```json
{
  "error": "Project not found",
  "message": "Projekt s ID 999 nebyl nalezen"
}
```

## Implementační Poznámky

1. **Bezpečnost**: Všechny endpoints vyžadují autentizaci
2. **Oprávnění**: 
   - `view`: všichni uživatelé s přístupem k projektům
   - `create/edit`: projektové manažeři a administrátoři
   - `assign_equipment`: pouze administrátoři a revizní technici
3. **Validace**: Kontrola logických vazeb (datumy, dostupnost jeřábů)
4. **Transakce**: Přiřazování/odebírání jeřábů v databázových transakcích
5. **Auditování**: Logování všech změn pro audit trail

## SQL Queries

Hlavní queries pro implementaci:

```sql
-- Seznam projektů s filtry
SELECT * FROM projects_overview 
WHERE ($1::text IS NULL OR status = $1)
  AND ($2::text IS NULL OR priority = $2)
  AND ($3::text IS NULL OR (name ILIKE '%' || $3 || '%' 
       OR client ILIKE '%' || $3 || '%' 
       OR project_number ILIKE '%' || $3 || '%'))
ORDER BY created_at DESC;

-- Dostupné jeřáby
SELECT * FROM available_equipment ORDER BY id;

-- Přiřazení jeřábu (použití funkce)
SELECT assign_equipment_to_project($1, $2, $3, $4, $5, $6, $7, $8);
```