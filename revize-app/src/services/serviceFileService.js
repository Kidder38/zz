import api from './api';

/**
 * Získá všechny soubory pro daný servisní výjezd
 * @param {number} serviceId - ID servisního výjezdu
 * @returns {Promise<Array>} - Pole souborů
 */
export const getServiceFiles = async (serviceId) => {
  try {
    const response = await api.get(`/service/${serviceId}/files`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service files:', error);
    throw error;
  }
};

/**
 * Nahraje soubor k servisnímu výjezdu
 * @param {number} serviceId - ID servisního výjezdu
 * @param {File} file - Soubor k nahrání
 * @param {string} description - Popis souboru
 * @returns {Promise<Object>} - Nahraný soubor
 */
export const uploadServiceFile = async (serviceId, file, description = '') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);

    const response = await api.post(`/service/${serviceId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading service file:', error);
    throw error;
  }
};

/**
 * Smaže soubor
 * @param {number} fileId - ID souboru
 * @returns {Promise<Object>} - Odpověď serveru
 */
export const deleteServiceFile = async (fileId) => {
  try {
    const response = await api.delete(`/service-files/${fileId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting service file:', error);
    throw error;
  }
};

/**
 * Získá URL pro stažení souboru
 * @param {number} fileId - ID souboru
 * @returns {string} - URL pro stažení souboru
 */
export const getServiceFileDownloadUrl = (fileId) => {
  if (!fileId) return '';
  return `${api.defaults.baseURL}/service-files/${fileId}/download`;
};

/**
 * Aktualizuje informace o souboru
 * @param {number} fileId - ID souboru
 * @param {Object} fileData - Data k aktualizaci
 * @returns {Promise<Object>} - Aktualizovaný soubor
 */
export const updateServiceFileInfo = async (fileId, fileData) => {
  try {
    const response = await api.put(`/service-files/${fileId}`, fileData);
    return response.data;
  } catch (error) {
    console.error('Error updating service file info:', error);
    throw error;
  }
};