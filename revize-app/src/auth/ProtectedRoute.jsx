import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { hasPermission } from './roles';

/**
 * Komponenta pro ochranu cest vyžadujících autorizaci
 * 
 * @param {Object} props
 * @param {React.Component} props.element - Komponenta k zobrazení, pokud je uživatel autorizován
 * @param {string} props.module - Modul aplikace (např. 'customers', 'equipment')
 * @param {string} props.action - Akce v rámci modulu (např. 'view', 'edit')
 */
const ProtectedRoute = ({ element, module, action = 'view' }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  // Pokud uživatel není přihlášen, přesměrujeme na přihlašovací stránku
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Pokud je zadán modul a akce, kontrolujeme oprávnění
  if (module && action) {
    const isAuthorized = hasPermission(currentUser.role, module, action);
    
    // Pokud uživatel nemá oprávnění, přesměrujeme na stránku s chybou
    if (!isAuthorized) {
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // Pokud je vše v pořádku, zobrazíme požadovanou komponentu
  return element;
};

export default ProtectedRoute;