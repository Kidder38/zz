import api from './api';

export const getConfigurationsForEquipment = async (equipmentId) => {
  try {
    const response = await api.get(`/equipment-configs/equipment/${equipmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při načítání konfigurací zařízení ${equipmentId}:`, error);
    throw error;
  }
};

export const getConfigurationById = async (id) => {
  try {
    const response = await api.get(`/equipment-configs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při načítání konfigurace ${id}:`, error);
    throw error;
  }
};

export const createConfiguration = async (configData) => {
  try {
    const response = await api.post('/equipment-configs', configData);
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření konfigurace:', error);
    throw error;
  }
};

export const updateConfiguration = async (id, configData) => {
  try {
    const response = await api.put(`/equipment-configs/${id}`, configData);
    return response.data;
  } catch (error) {
    console.error(`Chyba při aktualizaci konfigurace ${id}:`, error);
    throw error;
  }
};

export const deleteConfiguration = async (id) => {
  try {
    const response = await api.delete(`/equipment-configs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při mazání konfigurace ${id}:`, error);
    throw error;
  }
};