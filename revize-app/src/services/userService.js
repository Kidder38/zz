import api from './api';

// Přihlášení uživatele
export const login = async (username, password) => {
  try {
    const response = await api.post('/users/login', { username, password });
    
    // Uložit token do localStorage
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('currentUser', JSON.stringify({
        id: response.data.id,
        username: response.data.username,
        name: response.data.name,
        role: response.data.role
      }));
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error.response?.data || { error: 'Došlo k chybě při přihlašování' };
  }
};

// Odhlášení uživatele
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
};

// Získat seznam všech uživatelů (pouze pro adminy)
export const getUsers = async () => {
  try {
    // Mock data pro development - v produkci by se používalo API
    const mockUsers = [
      {
        id: 1,
        username: 'admin',
        first_name: 'Administrator',
        last_name: 'System',
        email: 'admin@example.com',
        role: 'admin',
        is_active: true,
        is_operator: false
      },
      {
        id: 2,
        username: 'revizni.technik',
        first_name: 'Jan',
        last_name: 'Revizní',
        email: 'jan.revizni@example.com',
        role: 'revision_technician',
        is_active: true,
        is_operator: false
      },
      {
        id: 4,
        username: 'jan.novak',
        first_name: 'Jan',
        last_name: 'Novák',
        email: 'jan.novak@example.com',
        phone: '+420 123 456 789',
        role: 'operator',
        is_active: true,
        is_operator: true,
        operator_card_number: 'OP-2024-001',
        certification_valid_until: '2025-12-31'
      }
    ];
    
    // Simulace API zpoždění
    return new Promise(resolve => {
      setTimeout(() => resolve(mockUsers), 300);
    });
  } catch (error) {
    console.error('Error getting users:', error);
    throw { error: 'Došlo k chybě při načítání uživatelů' };
  }
};

// Získat detaily konkrétního uživatele (pouze pro adminy)
export const getUser = async (id) => {
  try {
    const users = await getUsers();
    const user = users.find(u => u.id === parseInt(id));
    
    if (!user) {
      throw { error: 'Uživatel nenalezen' };
    }
    
    // Simulace API zpoždění
    return new Promise(resolve => {
      setTimeout(() => resolve(user), 200);
    });
  } catch (error) {
    console.error(`Error getting user ${id}:`, error);
    throw { error: 'Došlo k chybě při načítání uživatele' };
  }
};

// Vytvořit nového uživatele (pouze pro adminy)
export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error.response?.data || { error: 'Došlo k chybě při vytváření uživatele' };
  }
};

// Aktualizovat existujícího uživatele (pouze pro adminy)
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error.response?.data || { error: 'Došlo k chybě při aktualizaci uživatele' };
  }
};

// Smazat uživatele (pouze pro adminy)
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error.response?.data || { error: 'Došlo k chybě při mazání uživatele' };
  }
};

// Změnit vlastní heslo (pro všechny uživatele)
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post('/users/change-password', { 
      currentPassword, 
      newPassword 
    });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error.response?.data || { error: 'Došlo k chybě při změně hesla' };
  }
};

// Získat vlastní profil (pro všechny uživatele)
export const getProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error.response?.data || { error: 'Došlo k chybě při načítání profilu' };
  }
};