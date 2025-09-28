import api from './api';

export const getOperators = async () => {
  try {
    const response = await api.get('/operators');
    return response.data;
  } catch (error) {
    console.error('Chyba při načítání obsluhy:', error);
    throw error;
  }
};

export const getOperator = async (id) => {
  try {
    const response = await api.get(`/operators/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při načítání obsluhy ${id}:`, error);
    throw error;
  }
};

export const createOperator = async (operatorData) => {
  try {
    const response = await api.post('/operators', operatorData);
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření obsluhy:', error);
    throw error;
  }
};

export const updateOperator = async (id, operatorData) => {
  try {
    const response = await api.put(`/operators/${id}`, operatorData);
    return response.data;
  } catch (error) {
    console.error(`Chyba při aktualizaci obsluhy ${id}:`, error);
    throw error;
  }
};

export const deleteOperator = async (id) => {
  try {
    const response = await api.delete(`/operators/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při mazání obsluhy ${id}:`, error);
    throw error;
  }
};

export const getOperatorsForEquipment = async (equipmentId) => {
  try {
    const response = await api.get(`/operators/equipment/${equipmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při načítání obsluhy pro zařízení ${equipmentId}:`, error);
    throw error;
  }
};