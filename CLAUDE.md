# CLAUDE.md - AI Assistant Guide for Revize Codebase

**Last Updated**: 2025-11-14
**Codebase Size**: ~23,000 lines of code
**Language**: Primarily Czech (UI text, comments, database content)

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Directory Structure](#directory-structure)
4. [Key Technologies](#key-technologies)
5. [Development Workflows](#development-workflows)
6. [Code Conventions](#code-conventions)
7. [Database Schema](#database-schema)
8. [Authentication & Authorization](#authentication--authorization)
9. [Common Tasks Guide](#common-tasks-guide)
10. [Important Considerations](#important-considerations)

---

## Project Overview

**Revize** is a comprehensive crane and lifting equipment revision management system built for the Czech market. It manages:

- **Equipment lifecycle tracking**: Registration, configurations, locations, operators
- **Regulatory compliance**: Revision protocols per NV 193/2022 Sb. (Czech regulation)
- **Service management**: Service visits, inspections, defect tracking
- **Daily operations**: Operator logbooks per ČSN EN 12480-1 standard
- **Project management**: Construction sites, equipment assignments
- **Document generation**: PDF reports with proper Czech encoding

**Target Users**:
- **Administrators**: Full system access
- **Revision Technicians**: Create/manage revisions and inspections
- **Technicians**: Service work, equipment management
- **Operators**: Daily logbooks, equipment operation records

---

## Architecture

### Monorepo Structure

```
/home/user/zz/
├── revize-app/     # React frontend (SPA)
├── revize-api/     # Express.js backend (REST API)
├── database/       # Database dumps and documentation
└── package.json    # Root scripts for concurrent development
```

### Technology Stack

**Frontend (revize-app)**:
- React 18.2.0 with React Router 6.19.0
- Formik 2.4.5 + Yup 1.3.2 (form handling & validation)
- React Query 3.39.3 (server state management)
- Axios 1.6.2 (HTTP client with interceptors)
- Tailwind CSS 3.3.5 + @tailwindcss/forms (styling)
- Context API (authentication state)

**Backend (revize-api)**:
- Node.js + Express 4.18.2
- PostgreSQL with pg 8.11.3
- JWT authentication (jsonwebtoken 9.0.2)
- Puppeteer 24.9.0 + Handlebars 4.7.8 (PDF generation)
- Multer 1.4.5 (file uploads)
- Joi 17.11.0 (request validation)

**Database**:
- PostgreSQL 14+
- 20+ tables with complex relationships
- JSONB columns for flexible checklist data
- GPS coordinates for project locations

---

## Directory Structure

### Frontend (revize-app)

```
revize-app/
├── src/
│   ├── auth/                    # Authentication & authorization
│   │   ├── AuthContext.js       # Auth state management
│   │   ├── ProtectedRoute.js    # Route guards
│   │   └── roles.js             # Role definitions & permissions
│   │
│   ├── components/
│   │   ├── common/              # Shared components
│   │   │   ├── Layout.jsx       # Main layout wrapper
│   │   │   ├── Navbar.jsx       # Role-based navigation
│   │   │   ├── DateInput.jsx    # Reusable date picker
│   │   │   └── Modal.jsx        # Base modal component
│   │   │
│   │   ├── forms/               # 12+ form components
│   │   │   ├── RevisionForm.jsx # Complex revision protocol (most important)
│   │   │   ├── EquipmentForm.jsx
│   │   │   ├── CustomerForm.jsx
│   │   │   └── ...
│   │   │
│   │   ├── equipment/           # Equipment-specific components
│   │   ├── logbook/             # Daily check & fault report forms
│   │   ├── controls/            # Checklist components
│   │   ├── service/             # Service file management
│   │   └── modals/              # Modal dialogs
│   │
│   ├── pages/                   # 19 page components
│   │   ├── EquipmentDashboard.jsx
│   │   ├── EquipmentDetail.jsx
│   │   ├── Customers.jsx
│   │   └── ...
│   │
│   ├── services/                # 18 API service modules
│   │   ├── api.js              # Axios instance with interceptors
│   │   ├── customerService.js
│   │   ├── equipmentService.js
│   │   ├── revisionService.js
│   │   └── ...
│   │
│   ├── utils/                   # Utility functions
│   ├── App.js                   # Main router
│   └── index.js                 # Entry point with QueryClient
│
├── public/
├── tailwind.config.js
└── package.json
```

### Backend (revize-api)

```
revize-api/
├── controllers/                 # Business logic (13 controllers)
│   ├── customerController.js
│   ├── equipmentController.js
│   ├── revisionController.js    # Includes PDF generation
│   └── ...
│
├── routes/                      # API route definitions
│   ├── customerRoutes.js
│   ├── equipmentRoutes.js
│   └── ...
│
├── middleware/
│   ├── auth.js                  # JWT authentication & authorization
│   ├── errorHandler.js          # Global error handler
│   └── fileUpload.js            # Multer configuration
│
├── db/
│   ├── index.js                 # PostgreSQL connection pool
│   ├── schema.sql               # Base schema
│   └── migration_*.sql          # 14 migration files
│
├── utils/
│   ├── pdfGeneratorClean.js     # Puppeteer PDF generation
│   ├── jwtHelper.js             # JWT utilities
│   ├── chromeDetector.js        # Find Chrome executable
│   └── templates/
│       └── revisionTemplate.html # PDF template
│
├── fonts/                       # Custom fonts for PDFs
├── uploads/                     # File upload storage
│   ├── photos/
│   ├── datasheets/
│   ├── manuals/
│   └── services/
│
├── server.js                    # Express server entry point
└── package.json
```

---

## Key Technologies

### Frontend Patterns

#### 1. API Integration

**Centralized Axios Instance** (`src/services/api.js`):
```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  withCredentials: true
});

// Auto-attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-handle 401 errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### 2. Service Layer Pattern

**Consistent CRUD operations** (example: `src/services/customerService.js`):
```javascript
export const getCustomers = async () => api.get('/customers');
export const getCustomer = async (id) => api.get(`/customers/${id}`);
export const createCustomer = async (data) => api.post('/customers', data);
export const updateCustomer = async (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = async (id) => api.delete(`/customers/${id}`);
```

#### 3. Form Handling with Formik + Yup

**Standard pattern** (see `src/components/forms/RevisionForm.jsx`):
```javascript
// 1. Define validation schema
const RevisionSchema = Yup.object().shape({
  equipment_id: Yup.number().required('Zařízení je povinné'),
  technician_name: Yup.string().required('Jméno technika je povinné'),
  revision_date: Yup.date().required('Datum revize je povinné'),
  // Nested validations for JSONB fields
  measuring_instruments: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required(),
      range: Yup.string().required()
    })
  )
});

// 2. Use Formik wrapper
<Formik
  initialValues={initialValues}
  validationSchema={RevisionSchema}
  onSubmit={handleSubmit}
  enableReinitialize
>
  {({ values, setFieldValue }) => (
    <Form>
      <Field name="field_name" />
      <ErrorMessage name="field_name" component="div" className="error" />
    </Form>
  )}
</Formik>
```

#### 4. State Management

- **Server State**: React Query (useQuery, useMutation)
- **Authentication**: Context API (AuthContext)
- **Local State**: React hooks (useState, useEffect)

**React Query example**:
```javascript
const { data: equipment, isLoading } = useQuery(
  ['equipment', equipmentId],
  () => equipmentService.getEquipment(equipmentId)
);

const mutation = useMutation(
  (data) => equipmentService.updateEquipment(equipmentId, data),
  {
    onSuccess: () => {
      queryClient.invalidateQueries(['equipment', equipmentId]);
    }
  }
);
```

### Backend Patterns

#### 1. Controller Pattern

**Standard CRUD structure**:
```javascript
// controllers/entityController.js
exports.getEntities = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM entities');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createEntity = async (req, res) => {
  try {
    const { field1, field2 } = req.body;
    const result = await db.query(
      'INSERT INTO entities (field1, field2) VALUES ($1, $2) RETURNING *',
      [field1, field2]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

#### 2. Route Protection

**Apply auth middleware**:
```javascript
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, controller.getAll);
router.post('/', authenticate, authorize(['admin']), controller.create);
router.delete('/:id', authenticate, authorize(['admin']), controller.delete);
```

#### 3. Database Connection

**Connection pool** (`db/index.js`):
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};
```

---

## Development Workflows

### Setup from Scratch

```bash
# 1. Clone repository
git clone <repo-url>
cd zz

# 2. Install all dependencies
npm run install:all
# Equivalent to:
# cd revize-api && npm install
# cd ../revize-app && npm install

# 3. Setup database
psql -U postgres
CREATE DATABASE revize_db;
\q

# 4. Run schema and migrations
psql -U postgres -d revize_db < revize-api/db/schema.sql
psql -U postgres -d revize_db < revize-api/db/migration_users.sql
psql -U postgres -d revize_db < revize-api/db/migration_logbook_system.sql
# ... run remaining migrations in order

# OR: Import complete dump with test data
psql -U postgres -d revize_db < database/complete_database_dump.sql

# 5. Configure environment variables
cd revize-api
cp .env.example .env
# Edit .env with database credentials and JWT secret

cd ../revize-app
echo "REACT_APP_API_URL=http://localhost:3001/api" > .env

# 6. Start development servers
cd ..
npm run dev
# This runs both API (with nodemon) and frontend concurrently
```

### Daily Development

```bash
# Start full stack (from root)
npm run dev
# API: http://localhost:3001
# Frontend: http://localhost:3000

# Or start individually:
cd revize-api && npm run dev    # Backend only
cd revize-app && npm start      # Frontend only
```

### Database Migrations

**When adding new migrations**:
1. Create `migration_<name>.sql` in `revize-api/db/`
2. Number it sequentially
3. Test locally first: `psql -U postgres -d revize_db < revize-api/db/migration_<name>.sql`
4. Document in migration comments
5. Update this CLAUDE.md file

### Building for Production

```bash
# Frontend
cd revize-app
npm run build
# Output: /build directory (static files)

# Backend
cd revize-api
NODE_ENV=production npm start
# No build step needed
```

---

## Code Conventions

### Naming Conventions

**Database (PostgreSQL)**:
- Tables: `lowercase_plural` (customers, equipment, service_visits)
- Columns: `snake_case` (company_name, next_revision_date)
- Foreign keys: `singular_id` (customer_id, equipment_id)
- Junction tables: `table1_table2` (project_equipment, equipment_operators)

**Frontend (JavaScript/React)**:
- Components: `PascalCase.jsx` (CustomerForm.jsx, EquipmentDetail.jsx)
- Services: `camelCase.js` (customerService.js, equipmentService.js)
- Functions: `camelCase` (getCustomers, handleSubmit)
- Constants: `SCREAMING_SNAKE_CASE` (ROLES, PERMISSIONS)
- Props: `camelCase` (equipmentId, onSubmit)

**Backend (Node.js)**:
- Controllers: `camelCase.js` (customerController.js)
- Routes: `camelCase.js` (customerRoutes.js)
- API endpoints: `kebab-case` (/api/equipment-configs, /api/service-visits)
- Functions: `camelCase` (getRevisions, createCustomer)

### File Organization

**Feature-based grouping**:
- Group related files by domain (customer/, equipment/, revision/)
- Co-locate components with their specific use cases
- Separate shared/common components

**Separation of concerns**:
- Frontend: pages → components → services → API
- Backend: routes → controllers → database

### Code Style

**Imports order**:
```javascript
// 1. External libraries
import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';

// 2. Internal services/utils
import { getEquipment } from '../services/equipmentService';
import { formatDate } from '../utils/dateUtils';

// 3. Components
import Layout from '../components/common/Layout';
import CustomerModal from '../components/modals/CustomerModal';

// 4. Styles (if any)
import './styles.css';
```

**Component structure**:
```javascript
const ComponentName = ({ prop1, prop2 }) => {
  // 1. Hooks (useState, useEffect, useQuery, etc.)
  const [state, setState] = useState(initialState);

  // 2. Derived values
  const computedValue = useMemo(() => ..., [deps]);

  // 3. Event handlers
  const handleClick = () => { ... };

  // 4. Effects
  useEffect(() => { ... }, [deps]);

  // 5. Conditional returns
  if (loading) return <div>Loading...</div>;

  // 6. Main JSX
  return (
    <div>...</div>
  );
};

export default ComponentName;
```

### Error Handling

**Frontend**:
```javascript
try {
  const response = await customerService.getCustomer(id);
  setCustomer(response.data);
} catch (error) {
  console.error('Error fetching customer:', error);
  // Show user-friendly error message
  alert('Nepodařilo se načíst zákazníka');
}
```

**Backend**:
```javascript
exports.getCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM customers WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error in getCustomer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

---

## Database Schema

### Core Tables

#### customers
```sql
id SERIAL PRIMARY KEY
company_name VARCHAR(255) NOT NULL
street VARCHAR(255)
city VARCHAR(100)
postal_code VARCHAR(20)
contact_person VARCHAR(255)
email VARCHAR(255)
phone VARCHAR(50)
ico VARCHAR(20)           -- Company registration number
dic VARCHAR(20)           -- Tax ID
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### equipment
```sql
id SERIAL PRIMARY KEY
customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE
equipment_type VARCHAR(100) NOT NULL  -- 'tower_crane', 'mobile_crane', etc.
model VARCHAR(100)
manufacturer VARCHAR(100)
serial_number VARCHAR(100)
inventory_number VARCHAR(100)
year_of_manufacture INTEGER
max_load NUMERIC(10, 2)
category VARCHAR(50)                   -- 'A', 'B', 'C', 'D' per NV 193/2022
equipment_class VARCHAR(50)
last_revision_date DATE
next_revision_date DATE
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### equipment_configurations
```sql
id SERIAL PRIMARY KEY
equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE
min_reach NUMERIC(10, 2)
max_reach NUMERIC(10, 2)
lift_height NUMERIC(10, 2)
description TEXT
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```
**Note**: Equipment can have multiple configurations (e.g., different boom lengths)

#### revisions
```sql
id SERIAL PRIMARY KEY
equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE
equipment_configuration_id INTEGER REFERENCES equipment_configurations(id)
technician_name VARCHAR(255) NOT NULL
certification_number VARCHAR(100)
revision_date DATE NOT NULL
start_date DATE
test_start_date TIMESTAMP
test_end_date TIMESTAMP
report_date DATE
handover_date DATE
revision_number VARCHAR(50)
procedure_type VARCHAR(100)           -- 'initial', 'periodic', 'extraordinary'
location TEXT
evaluation VARCHAR(50)                -- 'passed', 'conditional', 'failed'
next_revision_date DATE
next_inspection_date DATE
technical_trend TEXT
documentation_check JSONB             -- NV 193/2022 section
equipment_check JSONB                 -- NV 193/2022 section
functional_test JSONB                 -- NV 193/2022 section
load_test JSONB                       -- NV 193/2022 section
measuring_instruments JSONB           -- Array of instruments used
technical_assessment TEXT
defects JSONB                         -- Array of defects found
dangers JSONB                         -- Array of dangers identified
notes TEXT
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**JSONB Structure Examples**:
```javascript
// documentation_check
{
  "operating_manual": true,
  "technical_documentation": true,
  "previous_revisions": true,
  "notes": "All documentation complete"
}

// measuring_instruments
[
  {
    "name": "Multimeter XYZ",
    "range": "0-1000V",
    "purpose": "Electrical measurements",
    "certificate_number": "CERT-2024-001",
    "valid_until": "2025-12-31"
  }
]

// defects
[
  {
    "description": "Worn brake pads",
    "severity": "medium",
    "location": "Main hoist",
    "recommendation": "Replace within 30 days"
  }
]
```

#### service_visits
```sql
id SERIAL PRIMARY KEY
equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE
visit_date DATE NOT NULL
hours_worked NUMERIC(5, 2)
description TEXT
parts_used TEXT
cost NUMERIC(10, 2)
invoiced BOOLEAN DEFAULT false
invoice_number VARCHAR(100)
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### inspections
```sql
id SERIAL PRIMARY KEY
equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE
inspector_name VARCHAR(255) NOT NULL
inspection_date DATE NOT NULL
inspection_type VARCHAR(100)          -- 'visual', 'operational', etc.
findings TEXT
recommendations TEXT
next_inspection_date DATE
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Extended Tables

#### projects
```sql
id SERIAL PRIMARY KEY
name VARCHAR(255) NOT NULL
project_number VARCHAR(100) UNIQUE
client VARCHAR(255)
location_address TEXT
location_gps_lat NUMERIC(10, 7)
location_gps_lng NUMERIC(10, 7)
status VARCHAR(50)                    -- 'planning', 'active', 'completed', 'cancelled'
priority VARCHAR(50)                  -- 'low', 'medium', 'high', 'urgent'
start_date DATE
planned_end_date DATE
actual_end_date DATE
project_manager VARCHAR(255)
site_manager VARCHAR(255)
client_contact VARCHAR(255)
notes TEXT
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### project_equipment (junction table)
```sql
id SERIAL PRIMARY KEY
project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE
equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE
assigned_date DATE NOT NULL
planned_removal_date DATE
actual_removal_date DATE
status VARCHAR(50)                    -- 'assigned', 'active', 'removed'
operator_id INTEGER REFERENCES operators(id)
operator_name VARCHAR(255)
notes TEXT
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### users
```sql
id SERIAL PRIMARY KEY
username VARCHAR(100) UNIQUE NOT NULL
password VARCHAR(255) NOT NULL        -- Hashed with bcrypt
name VARCHAR(255)
email VARCHAR(255)
role VARCHAR(50) NOT NULL             -- 'admin', 'revision_technician', 'technician', 'operator'
is_active BOOLEAN DEFAULT true
last_login TIMESTAMP
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### operators
```sql
id SERIAL PRIMARY KEY
first_name VARCHAR(100) NOT NULL
last_name VARCHAR(100) NOT NULL
operator_card_number VARCHAR(100) UNIQUE
certification_valid_until DATE
phone VARCHAR(50)
email VARCHAR(255)
notes TEXT
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### logbook_entries (per ČSN EN 12480-1)
```sql
id SERIAL PRIMARY KEY
equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE
operator_id INTEGER REFERENCES operators(id)
entry_date DATE NOT NULL
entry_time TIME
entry_type VARCHAR(50)                -- 'daily_check', 'fault_report', 'operation_record'
shift VARCHAR(50)
operating_hours NUMERIC(10, 2)
weather_conditions TEXT
notes TEXT
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### daily_checks (normalized checklist results)
```sql
id SERIAL PRIMARY KEY
logbook_entry_id INTEGER REFERENCES logbook_entries(id) ON DELETE CASCADE
check_category VARCHAR(100)           -- 'safety_devices', 'hydraulics', 'electrical', etc.
check_item VARCHAR(255)
check_result VARCHAR(50)              -- 'ok', 'defect', 'not_applicable'
notes TEXT
```

#### fault_reports
```sql
id SERIAL PRIMARY KEY
logbook_entry_id INTEGER REFERENCES logbook_entries(id) ON DELETE CASCADE
equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE
fault_type VARCHAR(100)
severity VARCHAR(50)                  -- 'low', 'medium', 'high', 'critical'
title VARCHAR(255) NOT NULL
description TEXT NOT NULL
equipment_stopped BOOLEAN DEFAULT false
resolved BOOLEAN DEFAULT false
resolution_date DATE
resolution_notes TEXT
```

### File Attachments

#### equipment_files
```sql
id SERIAL PRIMARY KEY
equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE
file_type VARCHAR(50)                 -- 'photo', 'datasheet', 'manual'
file_path VARCHAR(500) NOT NULL
original_filename VARCHAR(255)
description TEXT
uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**File storage**: `/revize-api/uploads/{file_type}/`

#### service_files
```sql
id SERIAL PRIMARY KEY
service_visit_id INTEGER REFERENCES service_visits(id) ON DELETE CASCADE
file_path VARCHAR(500) NOT NULL
original_filename VARCHAR(255)
description TEXT
uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**File storage**: `/revize-api/uploads/services/`

### Key Relationships

```
customers (1) ──→ (∞) equipment
equipment (1) ──→ (∞) equipment_configurations
equipment (1) ──→ (∞) revisions
equipment (1) ──→ (∞) service_visits
equipment (1) ──→ (∞) inspections
equipment (1) ──→ (∞) logbook_entries
equipment (∞) ←──→ (∞) projects (through project_equipment)
equipment (∞) ←──→ (∞) operators (through equipment_operators)
operators (1) ──→ (∞) logbook_entries
logbook_entries (1) ──→ (∞) daily_checks
logbook_entries (1) ──→ (∞) fault_reports
```

---

## Authentication & Authorization

### Roles

**4 user roles** (defined in `revize-app/src/auth/roles.js`):

```javascript
ROLES = {
  ADMIN: 'admin',                      // Full system access
  REVISION_TECHNICIAN: 'revision_technician',  // Revisions & inspections
  TECHNICIAN: 'technician',            // Service work
  OPERATOR: 'operator'                 // Daily logbooks only
}
```

### Permissions Matrix

| Module | View | Create | Edit | Delete |
|--------|------|--------|------|--------|
| **customers** | admin | admin | admin | admin |
| **equipment** | all | admin, revision_tech | admin, revision_tech | admin |
| **revisions** | admin, revision_tech | admin, revision_tech | admin, revision_tech | admin |
| **services** | admin, revision_tech, tech | admin, revision_tech, tech | admin, revision_tech, tech | admin |
| **inspections** | admin, revision_tech | admin, revision_tech | admin, revision_tech | admin |
| **logbook** | all | all | admin, revision_tech, tech | admin, revision_tech |
| **projects** | all | admin, revision_tech | admin, revision_tech | admin |
| **operators** | admin, revision_tech, tech | admin | admin | admin |
| **users** | admin | admin | admin | admin |

**Check permissions**:
```javascript
import { hasPermission } from '../auth/AuthContext';

// In component
const canEdit = hasPermission('equipment', 'edit');

// In ProtectedRoute
<ProtectedRoute
  element={<CustomersPage />}
  module="customers"
  action="view"
/>
```

### Frontend Auth Flow

1. User logs in → `AuthContext.login(username, password)`
2. Store JWT token in `localStorage.getItem('token')`
3. Store user object in `localStorage.getItem('currentUser')`
4. Axios interceptor adds token to all requests
5. On 401 response → auto logout and redirect to /login

### Backend Auth Flow

1. Client sends `Authorization: Bearer <token>` header
2. `authenticate` middleware verifies JWT
3. Decoded user attached to `req.user`
4. `authorize(['admin'])` middleware checks role
5. Controller executes if authorized

**Middleware usage**:
```javascript
const { authenticate, authorize } = require('../middleware/auth');

// Require authentication
router.get('/', authenticate, controller.getAll);

// Require specific role(s)
router.post('/', authenticate, authorize(['admin', 'revision_technician']), controller.create);

// Admin only
router.delete('/:id', authenticate, authorize(['admin']), controller.delete);
```

---

## Common Tasks Guide

### Adding a New Feature

#### Example: Adding "Maintenance Schedule" feature

**1. Database (Backend)**:
```sql
-- Create migration file: revize-api/db/migration_maintenance_schedules.sql
CREATE TABLE maintenance_schedules (
  id SERIAL PRIMARY KEY,
  equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
  schedule_type VARCHAR(50) NOT NULL,
  interval_days INTEGER NOT NULL,
  last_performed DATE,
  next_due DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_maintenance_schedules_equipment_id ON maintenance_schedules(equipment_id);
CREATE INDEX idx_maintenance_schedules_next_due ON maintenance_schedules(next_due);
```

**2. Backend API**:
```bash
# Create controller
touch revize-api/controllers/maintenanceController.js

# Create routes
touch revize-api/routes/maintenanceRoutes.js
```

```javascript
// controllers/maintenanceController.js
const db = require('../db');

exports.getSchedules = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM maintenance_schedules');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const { equipment_id, schedule_type, interval_days } = req.body;
    const result = await db.query(
      'INSERT INTO maintenance_schedules (equipment_id, schedule_type, interval_days) VALUES ($1, $2, $3) RETURNING *',
      [equipment_id, schedule_type, interval_days]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ... other CRUD operations
```

```javascript
// routes/maintenanceRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/maintenanceController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, controller.getSchedules);
router.post('/', authenticate, authorize(['admin', 'revision_technician']), controller.createSchedule);

module.exports = router;
```

```javascript
// server.js - Add route
const maintenanceRoutes = require('./routes/maintenanceRoutes');
app.use('/api/maintenance', maintenanceRoutes);
```

**3. Frontend Service**:
```javascript
// revize-app/src/services/maintenanceService.js
import api from './api';

export const getSchedules = async () => {
  return await api.get('/maintenance');
};

export const getSchedule = async (id) => {
  return await api.get(`/maintenance/${id}`);
};

export const createSchedule = async (data) => {
  return await api.post('/maintenance', data);
};

export const updateSchedule = async (id, data) => {
  return await api.put(`/maintenance/${id}`, data);
};

export const deleteSchedule = async (id) => {
  return await api.delete(`/maintenance/${id}`);
};
```

**4. Frontend Form Component**:
```javascript
// revize-app/src/components/forms/MaintenanceScheduleForm.jsx
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const MaintenanceScheduleSchema = Yup.object().shape({
  equipment_id: Yup.number().required('Zařízení je povinné'),
  schedule_type: Yup.string().required('Typ údržby je povinný'),
  interval_days: Yup.number().positive().required('Interval je povinný')
});

const MaintenanceScheduleForm = ({ initialValues, onSubmit, onCancel }) => {
  return (
    <Formik
      initialValues={initialValues || {
        equipment_id: '',
        schedule_type: '',
        interval_days: 30,
        notes: ''
      }}
      validationSchema={MaintenanceScheduleSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Typ údržby</label>
            <Field name="schedule_type" className="mt-1 block w-full rounded-md border-gray-300" />
            <ErrorMessage name="schedule_type" component="div" className="text-red-600 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium">Interval (dny)</label>
            <Field type="number" name="interval_days" className="mt-1 block w-full rounded-md border-gray-300" />
            <ErrorMessage name="interval_days" component="div" className="text-red-600 text-sm" />
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Zrušit
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              Uložit
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default MaintenanceScheduleForm;
```

**5. Frontend Page**:
```javascript
// revize-app/src/pages/MaintenanceSchedules.jsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Layout from '../components/common/Layout';
import MaintenanceScheduleForm from '../components/forms/MaintenanceScheduleForm';
import * as maintenanceService from '../services/maintenanceService';

const MaintenanceSchedules = () => {
  const queryClient = useQueryClient();
  const { data: schedules, isLoading } = useQuery('schedules', maintenanceService.getSchedules);

  const createMutation = useMutation(
    maintenanceService.createSchedule,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('schedules');
        alert('Plán údržby byl vytvořen');
      }
    }
  );

  if (isLoading) return <Layout><div>Načítání...</div></Layout>;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Plány údržby</h1>
      <MaintenanceScheduleForm onSubmit={createMutation.mutate} />
      {/* List schedules... */}
    </Layout>
  );
};

export default MaintenanceSchedules;
```

**6. Add Route**:
```javascript
// revize-app/src/App.js
import MaintenanceSchedules from './pages/MaintenanceSchedules';

function App() {
  return (
    <Routes>
      {/* ... existing routes */}
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute
            element={<MaintenanceSchedules />}
            module="maintenance"
            action="view"
          />
        }
      />
    </Routes>
  );
}
```

**7. Update Permissions** (if needed):
```javascript
// revize-app/src/auth/roles.js
export const PERMISSIONS = {
  // ... existing permissions
  maintenance: {
    view: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN, ROLES.TECHNICIAN],
    create: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN],
    edit: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN],
    delete: [ROLES.ADMIN]
  }
};
```

### Adding a New Field to Existing Table

**Example: Adding `warranty_expiry` to equipment table**

**1. Create migration**:
```sql
-- revize-api/db/migration_add_warranty_expiry.sql
ALTER TABLE equipment ADD COLUMN warranty_expiry DATE;
CREATE INDEX idx_equipment_warranty_expiry ON equipment(warranty_expiry);
```

**2. Update frontend form**:
```javascript
// In EquipmentForm.jsx validation schema
warranty_expiry: Yup.date().nullable()

// In form JSX
<DateInput
  name="warranty_expiry"
  label="Konec záruky"
/>
```

**3. Update backend controller** (if needed):
```javascript
// In equipmentController.js createEquipment
const { ..., warranty_expiry } = req.body;
// Add to INSERT query
```

### Debugging Common Issues

#### 1. "Cannot read property of undefined" in forms

**Cause**: Initial values don't match Formik structure

**Fix**: Ensure initialValues includes all fields:
```javascript
initialValues={{
  field1: data?.field1 || '',
  field2: data?.field2 || '',
  nestedField: data?.nestedField || []
}}
```

#### 2. CORS errors

**Cause**: Frontend and backend origin mismatch

**Fix**: Check `revize-api/.env`:
```bash
CORS_ORIGIN=http://localhost:3000
```

#### 3. JWT token expired/invalid

**Cause**: Token verification fails or expired

**Fix**:
- Clear localStorage and re-login
- Check JWT_SECRET matches between frontend and backend
- Verify token expiration time in `jwtHelper.js`

#### 4. File uploads failing

**Cause**: Multer configuration or file size limits

**Fix**: Check `middleware/fileUpload.js`:
```javascript
limits: { fileSize: 10 * 1024 * 1024 } // 10MB
```

Ensure upload directories exist:
```bash
mkdir -p revize-api/uploads/{photos,datasheets,manuals,services}
```

#### 5. PDF generation fails

**Cause**: Chrome/Chromium not found

**Fix**:
1. Install Chrome/Chromium
2. Check `utils/chromeDetector.js` paths
3. Or set `PUPPETEER_EXECUTABLE_PATH` in `.env`

#### 6. Database connection errors

**Cause**: PostgreSQL not running or wrong credentials

**Fix**:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U postgres -d revize_db

# Verify .env variables
cat revize-api/.env
```

---

## Important Considerations

### Czech Language & Localization

**UI Text**: All user-facing text is in Czech (cs-CZ)
- Button labels: "Uložit", "Zrušit", "Smazat"
- Form labels: "Zákazník", "Jeřáb", "Datum revize"
- Validation messages: "Toto pole je povinné"

**Database Content**: Czech text in:
- Customer names, addresses
- Equipment descriptions
- Notes and comments

**Date Formatting**: Czech format (DD.MM.YYYY)
```javascript
// Use Czech locale
new Date(date).toLocaleDateString('cs-CZ')
```

**PDF Generation**:
- Must support Czech characters (ě, š, č, ř, ž, ý, á, í, é, ú, ů)
- Puppeteer handles this correctly with UTF-8 encoding

### Regulatory Compliance

**NV 193/2022 Sb.**: Czech regulation for lifting equipment inspections
- Revision protocol must include specific sections
- Documentation check, equipment check, functional tests, load tests
- Measuring instruments must be certified and documented
- Next revision dates calculated based on equipment category

**ČSN EN 12480-1**: European standard for crane logbooks
- Daily checks required before operation
- Fault reporting system
- Operator certification tracking

**Data to preserve**:
- All revision records (legal requirement: 10+ years)
- Service visit records
- Inspection reports
- Operator logbooks

### Security Considerations

**Password Storage**:
- Backend uses bcrypt hashing
- Frontend never stores passwords in plain text

**JWT Tokens**:
- Stored in localStorage (consider httpOnly cookies for production)
- Auto-refresh not implemented (TODO: add token refresh)

**File Uploads**:
- Validate file types (images, PDFs only)
- Sanitize filenames
- Size limits enforced (10MB)
- Store outside public directory

**SQL Injection Prevention**:
- Always use parameterized queries: `db.query(sql, [param1, param2])`
- Never concatenate user input into SQL strings

**CORS**:
- Restrict to specific origins in production
- Never use `origin: '*'` in production

### Performance Considerations

**Database Queries**:
- Use indexes on foreign keys and date columns
- Avoid N+1 queries (use JOINs or batch queries)
- Consider pagination for large lists

**Frontend**:
- React Query caches API responses
- Lazy load heavy components
- Optimize images before upload

**PDF Generation**:
- CPU-intensive operation
- Consider queue system for batch generation
- Puppeteer keeps Chrome process alive (memory usage)

### Backup & Data Safety

**Database Backups**:
```bash
# Create backup
pg_dump -U postgres revize_db > backup_$(date +%Y%m%d).sql

# Restore backup
psql -U postgres -d revize_db < backup_20250114.sql
```

**File Uploads**:
- Backup `/revize-api/uploads/` directory
- Consider cloud storage (S3, Azure Blob) for production

### Future Improvements (TODO)

1. **Testing**: Add unit tests (Jest) and E2E tests (Cypress)
2. **Authentication**: Implement real user authentication API (currently mock)
3. **Token Refresh**: Auto-refresh JWT tokens before expiry
4. **Email Notifications**: Send reminders for upcoming revisions
5. **Mobile App**: React Native app for operators
6. **Offline Mode**: PWA with offline support for logbooks
7. **Reporting**: Dashboard with charts and statistics
8. **Export**: Excel/CSV export for reports
9. **Multi-language**: Support English and Slovak
10. **API Documentation**: Swagger/OpenAPI documentation

---

## Git Workflow

### Branch Naming

- Feature branches: `claude/claude-md-<session-id>`
- Always develop on the designated branch
- Commit frequently with descriptive messages

### Commit Messages

Use conventional commits format:
```
feat: Add maintenance schedule feature
fix: Resolve PDF generation Czech encoding issue
docs: Update CLAUDE.md with new conventions
refactor: Simplify equipment service layer
```

### Pushing Changes

```bash
# Always push to designated branch
git push -u origin claude/claude-md-<session-id>

# If push fails due to network, retry with exponential backoff
# (automated in CI/CD, manual retries: 2s, 4s, 8s, 16s intervals)
```

---

## Quick Reference

### Start Development
```bash
npm run dev  # From root - starts both frontend & backend
```

### Important Ports
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Database: localhost:5432

### Key Files
- **Frontend entry**: `revize-app/src/index.js`
- **Frontend router**: `revize-app/src/App.js`
- **Backend entry**: `revize-api/server.js`
- **DB connection**: `revize-api/db/index.js`
- **Auth config**: `revize-app/src/auth/roles.js`

### Environment Variables
- Backend: `revize-api/.env`
- Frontend: `revize-app/.env`

### Database
```bash
# Connect to DB
psql -U postgres -d revize_db

# Run migration
psql -U postgres -d revize_db < revize-api/db/migration_<name>.sql

# Create backup
pg_dump -U postgres revize_db > backup.sql
```

### Common Commands
```bash
# Install all dependencies
npm run install:all

# Start frontend only
cd revize-app && npm start

# Start backend only (dev mode)
cd revize-api && npm run dev

# Build frontend for production
cd revize-app && npm run build

# Lint code
cd revize-app && npm run lint
cd revize-api && npm run lint
```

---

## Contact & Support

For questions about this codebase:
1. Review this CLAUDE.md file
2. Check `project-spec.md` for detailed requirements
3. Check `technical-solution.md` for architecture decisions
4. Examine existing similar features for patterns
5. Search codebase for similar implementations

**Key Documentation Files**:
- `/README.md` - Project overview and setup
- `/project-spec.md` - Detailed feature specifications
- `/technical-solution.md` - Technical architecture
- `/CLAUDE.md` - This file (AI assistant guide)

---

**Last updated**: 2025-11-14
**Version**: 1.0
**Maintained by**: AI assistants working on this codebase

Remember: This is a production system managing critical safety equipment. Always prioritize data integrity, regulatory compliance, and user safety.
