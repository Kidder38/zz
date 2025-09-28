import api from './api';

export const getDefects = async () => {
  try {
    const response = await api.get('/defects');
    return response.data;
  } catch (error) {
    console.error('Chyba při načítání závad:', error);
    throw error;
  }
};

export const getDefectsByRevisionId = async (revisionId) => {
  try {
    const response = await api.get(`/defects/revision/${revisionId}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při načítání závad pro revizi ${revisionId}:`, error);
    throw error;
  }
};

export const createDefect = async (defectData) => {
  try {
    const response = await api.post('/defects', defectData);
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření závady:', error);
    throw error;
  }
};

export const updateDefect = async (id, defectData) => {
  try {
    const response = await api.put(`/defects/${id}`, defectData);
    return response.data;
  } catch (error) {
    console.error(`Chyba při aktualizaci závady ${id}:`, error);
    throw error;
  }
};

export const deleteDefect = async (id) => {
  try {
    const response = await api.delete(`/defects/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při mazání závady ${id}:`, error);
    throw error;
  }
};