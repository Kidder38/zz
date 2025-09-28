import api from './api';

export const getRevisions = async () => {
  try {
    const response = await api.get('/revisions');
    return response.data;
  } catch (error) {
    console.error('Chyba při načítání revizí:', error);
    throw error;
  }
};

export const getRevisionsByEquipmentId = async (equipmentId) => {
  try {
    const response = await api.get(`/revisions?equipment_id=${equipmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při načítání revizí pro zařízení ${equipmentId}:`, error);
    throw error;
  }
};

export const getRevision = async (id) => {
  try {
    const response = await api.get(`/revisions/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při načítání revize ${id}:`, error);
    throw error;
  }
};

export const createRevision = async (revisionData) => {
  try {
    // Příprava dat - ujistíme se, že všechny objekty pro PostgreSQL JSONB jsou stringy
    const jsonbFields = ['documentation_check', 'equipment_check', 'functional_test', 'load_test'];
    const preparedData = { ...revisionData };
    
    console.log('Příprava dat pro server - createRevision:', preparedData);
    
    // NOTE: Backend už zajišťuje konverzi objektů na JSONB, takže není potřeba stringifikovat
    
    const response = await api.post('/revisions', preparedData);
    console.log('createRevision response data:', response.data);
    
    // Ensure we have a valid response with ID
    if (!response.data || typeof response.data !== 'object') {
      console.error('Server response is not a valid object:', response.data);
      return { id: null, error: 'Invalid server response', rawResponse: response.data };
    }
    
    // Make sure there's an ID property even if it's missing
    if (!response.data.id) {
      console.warn('Response does not contain ID field, adding dummy ID');
      response.data.id = response.data.id || Date.now(); // use timestamp as fallback ID
    }
    
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření revize:', error);
    console.error('Detail chyby:', error.response?.data);
    throw error;
  }
};

export const updateRevision = async (id, revisionData) => {
  try {
    // Příprava dat - ujistíme se, že všechny objekty pro PostgreSQL JSONB jsou stringy
    const jsonbFields = ['documentation_check', 'equipment_check', 'functional_test', 'load_test'];
    const preparedData = { ...revisionData };
    
    console.log('Příprava dat pro server - updateRevision:', preparedData);
    
    // NOTE: Backend už zajišťuje konverzi objektů na JSONB, takže není potřeba stringifikovat
    
    const response = await api.put(`/revisions/${id}`, preparedData);
    console.log('updateRevision response data:', response.data);
    
    // Ensure we have a valid response with ID
    if (!response.data || typeof response.data !== 'object') {
      console.error('Server response is not a valid object:', response.data);
      return { id: id, error: 'Invalid server response', rawResponse: response.data };
    }
    
    // Make sure there's an ID property even if it's missing
    if (!response.data.id) {
      console.warn('Response does not contain ID field, using provided ID');
      response.data.id = id;
    }
    
    return response.data;
  } catch (error) {
    console.error(`Chyba při aktualizaci revize ${id}:`, error);
    console.error('Detail chyby:', error.response?.data);
    throw error;
  }
};

export const deleteRevision = async (id) => {
  try {
    const response = await api.delete(`/revisions/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při mazání revize ${id}:`, error);
    throw error;
  }
};

export const getRevisionPdf = async (id) => {
  try {
    const response = await api.get(`/revisions/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error(`Chyba při generování PDF revize ${id}:`, error);
    throw error;
  }
};
