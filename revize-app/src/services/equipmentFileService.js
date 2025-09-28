import api from './api';

// Get all files for an equipment
export const getEquipmentFiles = async (equipmentId) => {
  try {
    const response = await api.get(`/equipment/${equipmentId}/files`);
    return response.data;
  } catch (error) {
    console.error('Error fetching equipment files:', error);
    throw error;
  }
};

// Get files by type for an equipment
export const getEquipmentFilesByType = async (equipmentId, fileType) => {
  try {
    const response = await api.get(`/equipment/${equipmentId}/files/${fileType}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${fileType} files for equipment:`, error);
    throw error;
  }
};

// Upload a file for an equipment
export const uploadEquipmentFile = async (equipmentId, fileData) => {
  try {
    // Create FormData to handle file upload
    const formData = new FormData();
    formData.append('file', fileData.file);
    formData.append('file_type', fileData.fileType);
    
    if (fileData.description) {
      formData.append('description', fileData.description);
    }
    
    const response = await api.post(`/equipment/${equipmentId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Get a specific file
export const getEquipmentFile = async (fileId) => {
  try {
    const response = await api.get(`/files/${fileId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching file details:', error);
    throw error;
  }
};

// Get file download URL
export const getFileDownloadUrl = (fileId) => {
  if (!fileId) return '';
  return `${api.defaults.baseURL}/files/${fileId}/download`;
};

// Update file info
export const updateEquipmentFileInfo = async (fileId, fileInfo) => {
  try {
    const response = await api.put(`/files/${fileId}`, fileInfo);
    return response.data;
  } catch (error) {
    console.error('Error updating file info:', error);
    throw error;
  }
};

// Delete a file
export const deleteEquipmentFile = async (fileId) => {
  try {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};