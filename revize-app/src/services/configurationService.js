import api from './api';

export const getConfigurationsForEquipment = async (equipmentId) => {
  try {
    const response = await api.get(`/equipment-configs/equipment/${equipmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při načítání konfigurací pro zařízení ${equipmentId}:`, error);
    throw error;
  }
};

export const getConfiguration = async (id) => {
  try {
    const response = await api.get(`/equipment-configs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při načítání konfigurace ${id}:`, error);
    throw error;
  }
};

export const createConfiguration = async (configurationData) => {
  try {
    const response = await api.post('/equipment-configs', configurationData);
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření konfigurace:', error);
    throw error;
  }
};

export const updateConfiguration = async (id, configurationData) => {
  try {
    const response = await api.put(`/equipment-configs/${id}`, configurationData);
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