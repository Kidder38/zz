import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ROLE_DESCRIPTIONS } from './roles';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Přesměrování po přihlášení
  const from = location.state?.from?.pathname || '/';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Vyplňte uživatelské jméno a heslo');
      return;
    }
    
    try {
      setLoading(true);
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Chyba přihlášení:', err);
      setError(err.message || 'Přihlášení se nezdařilo');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Přihlášení do systému
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Zadejte své přihlašovací údaje
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Uživatelské jméno</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Uživatelské jméno"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Heslo</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Heslo"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? 'Přihlašování...' : 'Přihlásit se'}
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Testovací účty
              </span>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 gap-3">
            <div className="p-2 bg-blue-50 rounded">
              <p className="text-sm font-medium text-gray-700">Administrátor</p>
              <p className="text-xs text-gray-500">Uživatel: admin</p>
              <p className="text-xs text-gray-500">Heslo: admin123</p>
            </div>
            <div className="p-2 bg-green-50 rounded">
              <p className="text-sm font-medium text-gray-700">Revizní technik</p>
              <p className="text-xs text-gray-500">Uživatel: revizni.technik</p>
              <p className="text-xs text-gray-500">Heslo: revize123</p>
            </div>
            <div className="p-2 bg-yellow-50 rounded">
              <p className="text-sm font-medium text-gray-700">Technik</p>
              <p className="text-xs text-gray-500">Uživatel: technik</p>
              <p className="text-xs text-gray-500">Heslo: technik123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;