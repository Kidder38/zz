import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ROLE_DESCRIPTIONS } from './roles';

const UnauthorizedPage = () => {
  const { currentUser, logout } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Přístup odepřen
          </h2>
          <div className="mt-2 text-center text-sm text-gray-600">
            <p>
              Nemáte dostatečná oprávnění pro přístup k této stránce.
            </p>
            
            {currentUser && (
              <p className="mt-2">
                Přihlášen jako: <span className="font-medium">{currentUser.name}</span><br />
                Role: <span className="font-medium">{ROLE_DESCRIPTIONS[currentUser.role]}</span>
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-5 flex flex-col space-y-3">
          <Link 
            to="/" 
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Přejít na hlavní stránku
          </Link>
          
          <button
            onClick={logout}
            className="group relative w-full flex justify-center py-2 px-4 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Odhlásit se
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;