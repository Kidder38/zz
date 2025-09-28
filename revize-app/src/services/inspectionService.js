import api from './api';

export const getInspections = async () => {
  try {
    const response = await api.get('/inspections');
    return response.data;
  } catch (error) {
    console.error('Chyba při načítání inspekcí:', error);
    throw error;
  }
};

export const getInspectionsByEquipmentId = async (equipmentId) => {
  try {
    const response = await api.get(`/inspections?equipment_id=${equipmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při načítání inspekcí pro zařízení ${equipmentId}:`, error);
    throw error;
  }
};

export const getInspectionById = async (id) => {
  try {
    const response = await api.get(`/inspections/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při načítání inspekce ${id}:`, error);
    throw error;
  }
};

export const createInspection = async (inspectionData) => {
  try {
    const response = await api.post('/inspections', inspectionData);
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření inspekce:', error);
    throw error;
  }
};

export const updateInspection = async (id, inspectionData) => {
  try {
    const response = await api.put(`/inspections/${id}`, inspectionData);
    return response.data;
  } catch (error) {
    console.error(`Chyba při aktualizaci inspekce ${id}:`, error);
    throw error;
  }
};

export const deleteInspection = async (id) => {
  try {
    const response = await api.delete(`/inspections/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při mazání inspekce ${id}:`, error);
    throw error;
  }
};
