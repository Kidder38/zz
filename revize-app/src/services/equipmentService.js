import api from './api';

export const getEquipment = async () => {
  try {
    const response = await api.get('/equipment');
    return response.data;
  } catch (error) {
    console.error('Chyba při načítání zařízení:', error);
    throw error;
  }
};

export const getEquipmentItem = async (id) => {
  try {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při načítání zařízení ${id}:`, error);
    throw error;
  }
};

export const createEquipment = async (equipmentData) => {
  try {
    const response = await api.post('/equipment', equipmentData);
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření zařízení:', error);
    throw error;
  }
};

export const updateEquipment = async (id, equipmentData) => {
  try {
    const response = await api.put(`/equipment/${id}`, equipmentData);
    return response.data;
  } catch (error) {
    console.error(`Chyba při aktualizaci zařízení ${id}:`, error);
    throw error;
  }
};

export const deleteEquipment = async (id) => {
  try {
    const response = await api.delete(`/equipment/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při mazání zařízení ${id}:`, error);
    throw error;
  }
};

export const getEquipmentRevisions = async (id) => {
  try {
    const response = await api.get(`/equipment/${id}/revisions`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při načítání revizí zařízení ${id}:`, error);
    throw error;
  }
};

export const getEquipmentServiceVisits = async (id) => {
  try {
    const response = await api.get(`/equipment/${id}/service-visits`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při načítání servisních výjezdů zařízení ${id}:`, error);
    throw error;
  }
};

export const getEquipmentInspections = async (id) => {
  try {
    const response = await api.get(`/equipment/${id}/inspections`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při načítání inspekcí zařízení ${id}:`, error);
    throw error;
  }
};

// Získat zařízení filtrované podle role uživatele
export const getEquipmentForUser = async (user) => {
  try {
    const allEquipment = await getEquipment();
    
    // Pokud uživatel není operátor, vrátí všechna zařízení
    if (!user || !user.is_operator || user.role !== 'operator') {
      return allEquipment;
    }
    
    // Pro operátory filtruj pouze přiřazená zařízení
    if (user.assigned_equipment_ids && user.assigned_equipment_ids.length > 0) {
      return allEquipment.filter(equipment => 
        user.assigned_equipment_ids.includes(equipment.id)
      );
    }
    
    // Pokud operátor nemá přiřazená žádná zařízení, vrátí prázdné pole
    return [];
  } catch (error) {
    console.error('Chyba při načítání zařízení pro uživatele:', error);
    throw error;
  }
};
