import api from './api';

export const getCustomers = async () => {
  try {
    const response = await api.get('/customers');
    return response.data;
  } catch (error) {
    console.error('Chyba při načítání zákazníků:', error);
    throw error;
  }
};

export const getCustomer = async (id) => {
  try {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při načítání zákazníka ${id}:`, error);
    throw error;
  }
};

export const createCustomer = async (customerData) => {
  try {
    const response = await api.post('/customers', customerData);
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření zákazníka:', error);
    throw error;
  }
};

export const updateCustomer = async (id, customerData) => {
  try {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  } catch (error) {
    console.error(`Chyba při aktualizaci zákazníka ${id}:`, error);
    throw error;
  }
};

export const deleteCustomer = async (id) => {
  try {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při mazání zákazníka ${id}:`, error);
    throw error;
  }
};

export const getCustomerEquipment = async (id) => {
  try {
    const response = await api.get(`/customers/${id}/equipment`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při načítání zařízení zákazníka ${id}:`, error);
    throw error;
  }
};
