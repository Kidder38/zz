import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getAccessibleModules, ROLE_DESCRIPTIONS } from '../../auth/roles';
import EquipmentSearch from './EquipmentSearch';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Získání modulů, ke kterým má uživatel přístup
  const accessibleModules = currentUser ? getAccessibleModules(currentUser.role) : [];

  const isActive = (path) => {
    return location.pathname === path ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-200';
  };
  
  // Odkaz v menu je zobrazen pouze pokud má uživatel přístup k danému modulu
  const canAccess = (module) => {
    return accessibleModules.includes(module);
  };
  
  // Funkce pro odhlášení
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Přepínání zobrazení profilu
  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };
  
  // Přepínání zobrazení mobilního menu
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-primary text-2xl font-bold">
                Revize
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}
              >
                Přehled zařízení
              </Link>
              
              {canAccess('customers') && (
                <Link
                  to="/customers"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/customers')}`}
                >
                  Zákazníci
                </Link>
              )}
              
              {canAccess('equipment') && (
                <Link
                  to="/equipment"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/equipment')}`}
                >
                  🏗️ Zařízení & Lokace
                </Link>
              )}
              
              {canAccess('projects') && (
                <Link
                  to="/projects"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/projects')}`}
                >
                  🏗️ Stavby
                </Link>
              )}
              
              {canAccess('revisions') && (
                <Link
                  to="/revisions"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/revisions')}`}
                >
                  📋 Revize
                </Link>
              )}
              
              {canAccess('logbook') && (
                <Link
                  to="/crane-records"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/crane-records')}`}
                >
                  Všechny záznamy
                </Link>
              )}
              
              {canAccess('users') && (
                <Link
                  to="/users"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/users')}`}
                >
                  Uživatelé & Obsluha
                </Link>
              )}
            </div>
          </div>
          
          {/* Equipment Search */}
          <div className="hidden md:block">
            <EquipmentSearch />
          </div>

          {/* Profil uživatele a tlačítko pro přihlášení/odhlášení */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {currentUser ? (
              <div className="relative">
                <button 
                  onClick={toggleProfileMenu}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <span className="text-primary font-semibold">{currentUser.name}</span>
                  <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">{ROLE_DESCRIPTIONS[currentUser.role]}</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Dropdown menu pro uživatelský profil */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-semibold">{currentUser.name}</div>
                      <div className="text-gray-500">{ROLE_DESCRIPTIONS[currentUser.role]}</div>
                    </div>
                    <Link
                      to="/profile"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Můj profil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Odhlásit se
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium">
                Přihlášení
              </Link>
            )}
          </div>
          
          {/* Mobilní menu tlačítko */}
          <div className="flex items-center sm:hidden">
            {currentUser && (
              <div className="flex items-center mr-4">
                <span className="text-primary font-semibold text-sm">{currentUser.name}</span>
              </div>
            )}
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Otevřít hlavní menu</span>
              <svg
                className={`${showMobileMenu ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${showMobileMenu ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobilní menu */}
      {showMobileMenu && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/')}`}
            >
              Domů
            </Link>
            
            {canAccess('customers') && (
              <Link
                to="/customers"
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/customers')}`}
              >
                Zákazníci
              </Link>
            )}
            
            {canAccess('equipment') && (
              <Link
                to="/equipment"
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/equipment')}`}
              >
                Zařízení & Lokace
              </Link>
            )}
            
            {canAccess('revisions') && (
              <Link
                to="/revisions"
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/revisions')}`}
              >
                Revize
              </Link>
            )}
            
            {canAccess('service_visits') && (
              <Link
                to="/services"
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/services')}`}
              >
                Servis
              </Link>
            )}
            
            {canAccess('inspections') && (
              <Link
                to="/inspections"
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/inspections')}`}
              >
                Inspekce
              </Link>
            )}
            
            {canAccess('users') && (
              <Link
                to="/users"
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/users')}`}
              >
                Uživatelé & Obsluha
              </Link>
            )}
            
            {currentUser ? (
              <>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                >
                  Můj profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100"
                >
                  Odhlásit se
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-white"
              >
                Přihlášení
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
