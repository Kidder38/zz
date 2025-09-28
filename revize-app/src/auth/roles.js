/**
 * Definice uživatelských rolí a jejich oprávnění
 */

// Typy rolí
export const ROLES = {
  ADMIN: 'admin',
  REVISION_TECHNICIAN: 'revision_technician',
  TECHNICIAN: 'technician',
  OPERATOR: 'operator'
};

// Popis rolí pro zobrazení v UI
export const ROLE_DESCRIPTIONS = {
  [ROLES.ADMIN]: 'Administrátor',
  [ROLES.REVISION_TECHNICIAN]: 'Revizní technik',
  [ROLES.TECHNICIAN]: 'Technik',
  [ROLES.OPERATOR]: 'Obsluha'
};

// Definice oprávnění podle modulu pro jednotlivé role
export const PERMISSIONS = {
  customers: {
    view: [ROLES.ADMIN],
    create: [ROLES.ADMIN],
    edit: [ROLES.ADMIN],
    delete: [ROLES.ADMIN]
  },
  equipment: {
    view: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN, ROLES.TECHNICIAN, ROLES.OPERATOR],
    create: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN],
    edit: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN],
    delete: [ROLES.ADMIN]
  },
  locations: {
    view: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN, ROLES.TECHNICIAN],
    create: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN],
    edit: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN],
    delete: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN]
  },
  revisions: {
    view: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN],
    create: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN],
    edit: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN],
    delete: [ROLES.ADMIN]
  },
  inspections: {
    view: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN, ROLES.TECHNICIAN],
    create: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN, ROLES.TECHNICIAN],
    edit: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN, ROLES.TECHNICIAN],
    delete: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN]
  },
  service_visits: {
    view: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN, ROLES.TECHNICIAN],
    create: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN, ROLES.TECHNICIAN],
    edit: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN, ROLES.TECHNICIAN],
    delete: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN]
  },
  logbook: {
    view: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN, ROLES.TECHNICIAN, ROLES.OPERATOR],
    create: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN, ROLES.TECHNICIAN, ROLES.OPERATOR],
    edit: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN, ROLES.TECHNICIAN],
    delete: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN]
  },
  users: {
    view: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN],
    create: [ROLES.ADMIN],
    edit: [ROLES.ADMIN],
    delete: [ROLES.ADMIN],
    // Speciální oprávnění pro správu operátorů
    manage_operators: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN]
  },
  projects: {
    view: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN, ROLES.TECHNICIAN],
    create: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN],
    edit: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN],
    delete: [ROLES.ADMIN],
    // Speciální oprávnění pro přiřazování jeřábů
    assign_equipment: [ROLES.ADMIN, ROLES.REVISION_TECHNICIAN]
  }
};

// Kontrola, zda má uživatel oprávnění pro danou akci
export const hasPermission = (userRole, module, action) => {
  if (!userRole || !module || !action) return false;
  
  // Administrátor má vždy přístup ke všemu
  if (userRole === ROLES.ADMIN) return true;
  
  // Kontrola, zda pro daný modul a akci existují oprávnění
  if (PERMISSIONS[module] && PERMISSIONS[module][action]) {
    return PERMISSIONS[module][action].includes(userRole);
  }
  
  return false;
};

// Moduly aplikace, ke kterým má uživatel přístup na základě role
export const getAccessibleModules = (userRole) => {
  if (!userRole) return [];
  
  // Administrátor má přístup ke všem modulům
  if (userRole === ROLES.ADMIN) {
    return Object.keys(PERMISSIONS);
  }
  
  // Pro ostatní role procházíme všechny moduly a kontrolujeme, zda má uživatel alespoň právo na zobrazení
  return Object.keys(PERMISSIONS).filter(module => 
    PERMISSIONS[module].view && PERMISSIONS[module].view.includes(userRole)
  );
};