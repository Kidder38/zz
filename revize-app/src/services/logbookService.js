import api from './api';

export const getLogbookEntries = async (equipmentId, params = {}) => {
  try {
    const response = await api.get(`/logbook/equipment/${equipmentId}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Chyba při načítání zápisů do deníku pro zařízení ${equipmentId}:`, error);
    throw error;
  }
};

export const getLogbookEntry = async (id) => {
  try {
    const response = await api.get(`/logbook/entry/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při načítání zápisu ${id}:`, error);
    throw error;
  }
};

export const createDailyCheckEntry = async (entryData) => {
  try {
    const response = await api.post('/logbook/daily-check', entryData);
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření denní kontroly:', error);
    throw error;
  }
};

export const createFaultReportEntry = async (entryData) => {
  try {
    const response = await api.post('/logbook/fault-report', entryData);
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření hlášení poruchy:', error);
    throw error;
  }
};

export const createOperationEntry = async (entryData) => {
  try {
    const response = await api.post('/logbook/operation', entryData);
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření provozního zápisu:', error);
    throw error;
  }
};

export const getChecklistTemplate = async (category = 'daily', equipmentType = null) => {
  try {
    const params = { category };
    if (equipmentType) {
      params.equipment_type = equipmentType;
    }
    const response = await api.get('/logbook/checklist-template', { params });
    
    // Pokud nenajdeme šablonu pro konkrétní typ, zkusíme obecnou
    if (response.data.length === 0 && equipmentType) {
      console.log(`Šablona pro typ "${equipmentType}" nenalezena, zkouším obecnou šablonu...`);
      const generalResponse = await api.get('/logbook/checklist-template', { params: { category } });
      return generalResponse.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('Chyba při načítání šablony kontrolního seznamu:', error);
    throw error;
  }
};

export const resolveFaultReport = async (faultReportId, resolutionData) => {
  try {
    const response = await api.put(`/logbook/fault-report/${faultReportId}/resolve`, resolutionData);
    return response.data;
  } catch (error) {
    console.error(`Chyba při řešení hlášení poruchy ${faultReportId}:`, error);
    throw error;
  }
};