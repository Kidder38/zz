import React, { createContext, useState, useContext, useEffect } from 'react';
import { ROLES } from './roles';

// Vytvoření React kontextu
const AuthContext = createContext(null);

// Provider komponenta pro správu autentizace
export const AuthProvider = ({ children }) => {
  // Stav uživatele a autentizace
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Při načtení aplikace se pokusíme načíst uživatele z localStorage
  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Chyba při načítání uživatele:', error);
          localStorage.removeItem('currentUser');
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, []);
  
  // Přihlášení uživatele
  const login = async (username, password) => {
    // Zde by normálně bylo API volání pro ověření přihlašovacích údajů
    // Pro jednoduchost implementujeme mock uživatele
    
    // Simulace API volání
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock uživatelé pro testování
        const users = {
          'admin': { 
            id: 1, 
            username: 'admin', 
            first_name: 'Administrator', 
            last_name: 'System',
            role: ROLES.ADMIN,
            password: 'admin',
            is_operator: true, // Administrátor může také provádět kontroly
            assigned_equipment_ids: [3], // Má přístup ke všem jeřábům
            equipment_ids: [3] // Alias pro kompatibilitu
          },
          'revizni.technik': { 
            id: 2, 
            username: 'revizni.technik', 
            first_name: 'Jan', 
            last_name: 'Revizní',
            role: ROLES.REVISION_TECHNICIAN,
            password: 'revize123',
            is_operator: false
          },
          'technik': { 
            id: 3, 
            username: 'technik', 
            first_name: 'Petr', 
            last_name: 'Technický',
            role: ROLES.TECHNICIAN,
            password: 'technik123',
            is_operator: false
          },
          'jan.novak': {
            id: 2,
            username: 'jan.novak',
            first_name: 'Jan',
            last_name: 'Novák', 
            role: ROLES.OPERATOR,
            password: 'operator123',
            is_operator: true,
            operator_card_number: 'OP-2024-001',
            certification_valid_until: '2025-12-31',
            assigned_equipment_ids: [3], // ID zařízení, která má přiřazená
            equipment_ids: [3] // Alias pro kompatibilitu s formulářem
          }
        };
        
        const user = users[username];
        
        if (user && user.password === password) {
          // Neposíláme heslo do stavu
          const { password, ...userWithoutPassword } = user;
          setCurrentUser(userWithoutPassword);
          
          // Uložení do localStorage pro perzistenci
          localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
          
          resolve(userWithoutPassword);
        } else {
          reject(new Error('Nesprávné přihlašovací údaje'));
        }
      }, 500); // Simulace síťového zpoždění
    });
  };
  
  // Odhlášení uživatele
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };
  
  // Změna role uživatele (pouze pro účely testování)
  const switchRole = (role) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, role };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };
  
  // Hodnoty poskytované kontextem
  const value = {
    currentUser,
    login,
    logout,
    switchRole,
    loading
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook pro snadnější použití autentizačního kontextu
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth musí být použit uvnitř AuthProvider');
  }
  return context;
};