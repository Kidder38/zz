import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getUsers, getUser, createUser, updateUser, deleteUser } from '../services/userService';
import { ROLE_DESCRIPTIONS } from '../auth/roles';
import UserForm from '../components/forms/UserForm';
import Modal from '../components/modals/Modal';

const Users = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Stavy pro modální okna
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'create', 'edit', 'delete'
  
  // Načtení seznamu uživatelů
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Chyba při načítání uživatelů:', err);
      setError('Nepodařilo se načíst seznam uživatelů. ' + (err.error || ''));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Načtení uživatelů při prvním renderu
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Otevření modálního okna pro vytvoření nového uživatele
  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setModalOpen(true);
  };
  
  // Otevření modálního okna pro zobrazení/editaci existujícího uživatele
  const handleViewUser = async (id) => {
    try {
      setIsLoading(true);
      const userData = await getUser(id);
      setSelectedUser(userData);
      setModalMode('view');
      setModalOpen(true);
    } catch (err) {
      console.error(`Chyba při načítání uživatele ID ${id}:`, err);
      setError('Nepodařilo se načíst detail uživatele. ' + (err.error || ''));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Přepnutí do režimu editace
  const handleEditUser = () => {
    setModalMode('edit');
  };
  
  // Otevření modálního okna pro potvrzení smazání
  const handleConfirmDelete = () => {
    setModalMode('delete');
  };
  
  // Odeslání formuláře pro vytvoření/editaci uživatele
  const handleSubmitUserForm = async (formData) => {
    try {
      setIsLoading(true);
      
      if (modalMode === 'create') {
        // Vytvoření nového uživatele
        await createUser(formData);
      } else if (modalMode === 'edit' && selectedUser) {
        // Aktualizace existujícího uživatele
        await updateUser(selectedUser.id, formData);
      }
      
      // Aktualizace seznamu uživatelů
      await fetchUsers();
      
      // Zavření modálního okna
      setModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Chyba při ukládání uživatele:', err);
      setError('Nepodařilo se uložit uživatele. ' + (err.error || ''));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Smazání uživatele
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setIsLoading(true);
      await deleteUser(selectedUser.id);
      
      // Aktualizace seznamu uživatelů
      await fetchUsers();
      
      // Zavření modálního okna
      setModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error(`Chyba při mazání uživatele ID ${selectedUser.id}:`, err);
      setError('Nepodařilo se smazat uživatele. ' + (err.error || ''));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Zavření modálního okna
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setError(null);
  };
  
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
  
  // Obsah modálního okna podle režimu
  const renderModalContent = () => {
    switch (modalMode) {
      case 'view':
        if (!selectedUser) return null;
        return (
          <>
            <h2 className="text-xl font-bold mb-4">Detail uživatele</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-600 text-sm">Uživatelské jméno</p>
                <p className="font-medium">{selectedUser.username}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Jméno</p>
                <p className="font-medium">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">E-mail</p>
                <p className="font-medium">{selectedUser.email || '-'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Role</p>
                <p className="font-medium">{ROLE_DESCRIPTIONS[selectedUser.role] || selectedUser.role}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Stav</p>
                <p className={`font-medium ${selectedUser.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedUser.is_active ? 'Aktivní' : 'Neaktivní'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Poslední přihlášení</p>
                <p className="font-medium">{formatDateTime(selectedUser.last_login)}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Vytvořen</p>
                <p className="font-medium">{formatDateTime(selectedUser.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Poslední úprava</p>
                <p className="font-medium">{formatDateTime(selectedUser.updated_at)}</p>
              </div>
            </div>
            
            {/* Tlačítka pro akce */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Zavřít
              </button>
              
              {currentUser && currentUser.role === 'admin' && selectedUser.username !== 'admin' && (
                <>
                  <button
                    onClick={handleEditUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Upravit
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Smazat
                  </button>
                </>
              )}
            </div>
          </>
        );
        
      case 'create':
        return (
          <>
            <h2 className="text-xl font-bold mb-4">Nový uživatel</h2>
            <UserForm
              onSubmit={handleSubmitUserForm}
              onCancel={handleCloseModal}
              isEditMode={false}
            />
          </>
        );
        
      case 'edit':
        if (!selectedUser) return null;
        return (
          <>
            <h2 className="text-xl font-bold mb-4">Upravit uživatele</h2>
            <UserForm
              user={selectedUser}
              onSubmit={handleSubmitUserForm}
              onCancel={handleCloseModal}
              isEditMode={true}
            />
          </>
        );
        
      case 'delete':
        if (!selectedUser) return null;
        return (
          <>
            <h2 className="text-xl font-bold mb-4">Smazat uživatele</h2>
            <p className="mb-6">
              Opravdu chcete smazat uživatele <span className="font-bold">{selectedUser.name}</span>?
              Tato akce je nevratná.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setModalMode('view')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Zrušit
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Smazat
              </button>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Správa uživatelů</h1>
        <button
          onClick={handleCreateUser}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Přidat uživatele
        </button>
      </div>
      
      {/* Zobrazení chyby */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Tabulka uživatelů */}
      {isLoading && !modalOpen ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Načítání...</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uživatelské jméno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jméno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-mail
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stav
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poslední přihlášení
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Žádní uživatelé nebyli nalezeni
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewUser(user.id)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ROLE_DESCRIPTIONS[user.role] || user.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Aktivní' : 'Neaktivní'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDateTime(user.last_login)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewUser(user.id);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modální okno */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} size="lg">
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default Users;