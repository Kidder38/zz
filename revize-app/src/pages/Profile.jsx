import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getProfile } from '../services/userService';
import { ROLE_DESCRIPTIONS } from '../auth/roles';
import PasswordChangeForm from '../components/forms/PasswordChangeForm';
import Modal from '../components/modals/Modal';

const Profile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  
  // Načtení profilu uživatele
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Chyba při načítání profilu:', err);
      setError('Nepodařilo se načíst profil. ' + (err.error || ''));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Načtení profilu při prvním renderu
  useEffect(() => {
    fetchProfile();
  }, []);
  
  // Formátování data a času
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Nikdy';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Otevření modálního okna pro změnu hesla
  const handleChangePassword = () => {
    setPasswordModalOpen(true);
  };
  
  // Zavření modálního okna pro změnu hesla
  const handleClosePasswordModal = () => {
    setPasswordModalOpen(false);
  };
  
  // Úspěšná změna hesla
  const handlePasswordChangeSuccess = () => {
    // Modální okno necháváme otevřené, aby uživatel viděl zprávu o úspěchu
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Můj profil</h1>
      
      {/* Zobrazení chyby */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Načítání */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Načítání...</p>
        </div>
      ) : profile ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Základní informace */}
          <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Osobní údaje</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Uživatelské jméno</p>
                <p className="font-medium">{profile.username}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Jméno</p>
                <p className="font-medium">{profile.name}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">E-mail</p>
                <p className="font-medium">{profile.email || '-'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Role</p>
                <p className="font-medium">{ROLE_DESCRIPTIONS[profile.role] || profile.role}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Poslední přihlášení</p>
                <p className="font-medium">{formatDateTime(profile.last_login)}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Účet vytvořen</p>
                <p className="font-medium">{formatDateTime(profile.created_at)}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Změnit heslo
              </button>
            </div>
          </div>
          
          {/* Statistiky a další informace */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Aktivita</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm">Stav účtu</p>
                <p className={`font-medium ${profile.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {profile.is_active ? 'Aktivní' : 'Neaktivní'}
                </p>
              </div>
              {/* Zde můžete přidat další statistiky uživatele */}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Nepodařilo se načíst profil.</p>
        </div>
      )}
      
      {/* Modální okno pro změnu hesla */}
      <Modal isOpen={passwordModalOpen} onClose={handleClosePasswordModal} size="md">
        <h2 className="text-xl font-bold mb-4">Změna hesla</h2>
        <PasswordChangeForm
          onSuccess={handlePasswordChangeSuccess}
          onCancel={handleClosePasswordModal}
        />
      </Modal>
    </div>
  );
};

export default Profile;