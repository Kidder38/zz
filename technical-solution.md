# Návrh technického řešení - Aplikace pro správu revizí zdvihacích zařízení

## Architektura systému

Aplikace bude postavena na architektuře klient-server s odděleným frontendem a backendem. Toto řešení umožňuje nezávislý vývoj obou částí a dobrou škálovatelnost.

```
[Prohlížeč] <---> [React Frontend] <---> [Express Backend API] <---> [PostgreSQL Databáze]
```

### Frontend (Klientská část)

Frontend bude implementován jako single-page aplikace (SPA) v React, což umožní rychlé a plynulé přechody mezi různými částmi aplikace bez nutnosti kompletního přenačítání stránky.

### Backend (Serverová část)

Backend bude implementován jako RESTful API s využitím Node.js a Express.js. Toto API bude zprostředkovávat veškerou komunikaci mezi frontendem a databází.

### Databáze

PostgreSQL databáze bude ukládat všechna data aplikace v relační struktuře.

## Technologie

### Frontend
- **React**: Knihovna pro tvorbu uživatelského rozhraní
- **React Router**: Navigace v rámci aplikace
- **Formik + Yup**: Správa a validace formulářů
- **Tailwind CSS**: Utility-first CSS framework pro stylování
- **Axios**: Klientská HTTP knihovna pro komunikaci s API
- **PDF.js**: Knihovna pro generování PDF dokumentů
- **React Query**: Správa stavů a cachování dat z API

### Backend
- **Node.js**: JavaScript runtime prostředí
- **Express.js**: Webový framework pro Node.js
- **pg (node-postgres)**: Klientská knihovna pro PostgreSQL
- **PDFKit**: Generování PDF dokumentů
- **JWT (JSON Web Tokens)**: Autentizace a autorizace
- **Multer**: Zpracování multipart/form-data pro nahrávání souborů
- **Joi**: Validace dat

### Databáze
- **PostgreSQL**: Relační databázový systém
- **Indexy**: Pro optimalizaci dotazů
- **Cizí klíče**: Pro zajištění referenční integrity

## Databázový model

### Zákazníci (customers)
- id (PK)
- company_name
- street
- city
- postal_code
- contact_person
- email
- phone
- created_at
- updated_at

### Zdvihací zařízení (equipment)
- id (PK)
- customer_id (FK → customers.id)
- equipment_type
- model
- manufacturer
- year_of_manufacture
- serial_number
- inventory_number
- min_reach
- max_reach
- max_load
- lift_height
- location
- classification
- last_revision_date
- next_revision_date
- created_at
- updated_at

### Revize (revisions)
- id (PK)
- equipment_id (FK → equipment.id)
- technician_name
- certification_number
- revision_date
- start_date
- evaluation
- next_revision_date
- next_inspection_date
- documentation_check (JSONB)
- equipment_check (JSONB)
- functional_test (JSONB)
- load_test (JSONB)
- conclusion
- created_at
- updated_at

### Servisní výjezdy (service_visits)
- id (PK)
- equipment_id (FK → equipment.id)
- technician_name
- visit_date
- hours_worked
- description
- parts_used
- cost
- invoiced
- invoice_number
- notes
- created_at
- updated_at

### Inspekce (inspections)
- id (PK)
- equipment_id (FK → equipment.id)
- inspector_name
- inspection_date
- inspection_type
- findings
- recommendations
- next_inspection_date
- created_at
- updated_at

## API Endpointy

### Zákazníci
- `GET /api/customers` - Seznam všech zákazníků
- `GET /api/customers/:id` - Detail zákazníka
- `POST /api/customers` - Vytvoření nového zákazníka
- `PUT /api/customers/:id` - Aktualizace zákazníka
- `DELETE /api/customers/:id` - Smazání zákazníka
- `GET /api/customers/:id/equipment` - Seznam zařízení zákazníka

### Zařízení
- `GET /api/equipment` - Seznam všech zařízení
- `GET /api/equipment/:id` - Detail zařízení
- `POST /api/equipment` - Vytvoření nového zařízení
- `PUT /api/equipment/:id` - Aktualizace zařízení
- `DELETE /api/equipment/:id` - Smazání zařízení
- `GET /api/equipment/:id/revisions` - Seznam revizí zařízení
- `GET /api/equipment/:id/service-visits` - Seznam servisních výjezdů
- `GET /api/equipment/:id/inspections` - Seznam inspekcí

### Revize
- `GET /api/revisions` - Seznam všech revizí
- `GET /api/revisions/:id` - Detail revize
- `POST /api/revisions` - Vytvoření nové revize
- `PUT /api/revisions/:id` - Aktualizace revize
- `DELETE /api/revisions/:id` - Smazání revize
- `GET /api/revisions/:id/pdf` - Generování PDF revizního protokolu

### Servisní výjezdy
- `GET /api/service-visits` - Seznam všech servisních výjezdů
- `GET /api/service-visits/:id` - Detail servisního výjezdu
- `POST /api/service-visits` - Vytvoření nového servisního výjezdu
- `PUT /api/service-visits/:id` - Aktualizace servisního výjezdu
- `DELETE /api/service-visits/:id` - Smazání servisního výjezdu

### Inspekce
- `GET /api/inspections` - Seznam všech inspekcí
- `GET /api/inspections/:id` - Detail inspekce
- `POST /api/inspections` - Vytvoření nové inspekce
- `PUT /api/inspections/:id` - Aktualizace inspekce
- `DELETE /api/inspections/:id` - Smazání inspekce

## Struktura adresářů projektu

### Frontend
```
revize-app/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── ...
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── ...
│   │   ├── customers/
│   │   │   ├── CustomerList.jsx
│   │   │   ├── CustomerDetail.jsx
│   │   │   ├── CustomerForm.jsx
│   │   │   └── ...
│   │   ├── equipment/
│   │   ├── revisions/
│   │   ├── service/
│   │   └── inspections/
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Customers.jsx
│   │   ├── Equipment.jsx
│   │   ├── Revisions.jsx
│   │   ├── Services.jsx
│   │   ├── Inspections.jsx
│   │   └── NotFound.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── customerService.js
│   │   ├── equipmentService.js
│   │   └── ...
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── ...
│   ├── App.js
│   ├── index.js
│   └── ...
├── package.json
├── tailwind.config.js
└── ...
```

### Backend
```
revize-api/
├── controllers/
│   ├── customerController.js
│   ├── equipmentController.js
│   ├── revisionController.js
│   ├── serviceController.js
│   └── inspectionController.js
├── db/
│   ├── index.js
│   └── schema.sql
├── routes/
│   ├── customerRoutes.js
│   ├── equipmentRoutes.js
│   ├── revisionRoutes.js
│   ├── serviceRoutes.js
│   └── inspectionRoutes.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── ...
├── utils/
│   ├── pdfGenerator.js
│   ├── validators.js
│   └── ...
├── server.js
├── package.json
└── ...
```

## Bezpečnostní aspekty

### Autentizace a autorizace
- Implementace JWT (JSON Web Tokens) pro autentizaci uživatelů
- Role a oprávnění pro různé typy uživatelů (admin, technik, zákazník)
- Zabezpečení API endpointů pomocí middleware

### Zabezpečení dat
- Validace vstupních dat na serveru
- Ochrana proti SQL injection pomocí parametrizovaných dotazů
- Implementace HTTPS pro šifrovanou komunikaci

## PDF generování

Pro generování PDF revizních protokolů bude použita knihovna PDFKit na straně serveru:

1. Frontend pošle požadavek na generování PDF s ID revize
2. Backend načte data z databáze
3. Pomocí šablony a knihovny PDFKit vygeneruje PDF dokument
4. PDF bude vráceno klientovi nebo uloženo na serveru s možností stažení

## Plán nasazení

### Vývojové prostředí
- Lokální vývoj s využitím Docker kontejnerů pro databázi
- Automatizované testy pro klíčové funkce aplikace

### Produkční prostředí
- Nasazení frontendu na statický hosting (např. Netlify, Vercel)
- Nasazení backendu na serverový hosting (např. Heroku, DigitalOcean)
- Produkční databáze PostgreSQL s pravidelným zálohováním

## Škálovatelnost a udržitelnost

### Škálovatelnost
- Horizontální škálování backendových instancí
- Cachování častých API požadavků
- Indexování databáze pro optimalizaci výkonu

### Udržitelnost
- Důsledné použití ESLint a Prettier pro konzistentní kód
- Dokumentace API pomocí JSDoc nebo Swagger
- Verzování API pro budoucí rozšíření

## Budoucí rozšíření

- Mobilní aplikace pro techniky v terénu
- Integrace s účetními systémy pro automatickou fakturaci
- Rozšíření o další typy zdvihacích zařízení (výtahy, plošiny)
- Analytický dashboard s grafy a statistikami
- Pokročilé notifikace (e-mail, SMS) pro blížící se termíny revizí
- Offline režim pro práci v terénu bez internetového připojení
