import api from './api';

export const getServiceVisits = async () => {
  try {
    const response = await api.get('/service-visits');
    return response.data;
  } catch (error) {
    console.error('Chyba při načítání servisních výjezdů:', error);
    throw error;
  }
};

export const getServiceVisitsByEquipmentId = async (equipmentId) => {
  try {
    const response = await api.get(`/service-visits?equipment_id=${equipmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při načítání servisních výjezdů pro zařízení ${equipmentId}:`, error);
    throw error;
  }
};

export const getServiceVisitById = async (id) => {
  try {
    const response = await api.get(`/service-visits/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při načítání servisního výjezdu ${id}:`, error);
    throw error;
  }
};

export const createServiceVisit = async (serviceData) => {
  try {
    const response = await api.post('/service-visits', serviceData);
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření servisního výjezdu:', error);
    throw error;
  }
};

export const updateServiceVisit = async (id, serviceData) => {
  try {
    const response = await api.put(`/service-visits/${id}`, serviceData);
    return response.data;
  } catch (error) {
    console.error(`Chyba při aktualizaci servisního výjezdu ${id}:`, error);
    throw error;
  }
};

export const deleteServiceVisit = async (id) => {
  try {
    const response = await api.delete(`/service-visits/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při mazání servisního výjezdu ${id}:`, error);
    throw error;
  }
};

export const createServiceRequestFromDefect = async (defectData) => {
  try {
    const serviceRequestData = {
      equipment_id: defectData.equipment_id,
      priority: defectData.critical ? 'high' : 'medium',
      status: 'open',
      description: `Požadavek na servis na základě kontroly - ${defectData.control_type}`,
      defect_details: defectData.defects,
      requested_date: new Date().toISOString(),
      control_record_id: defectData.record_id,
      service_type: 'corrective',
      urgency_level: defectData.critical ? 'immediate' : 'normal'
    };

    const response = await api.post('/service-requests', serviceRequestData);
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření servisního požadavku z závady:', error);
    throw error;
  }
};

export const getServiceRequests = async () => {
  try {
    const response = await api.get('/service-requests');
    return response.data;
  } catch (error) {
    console.error('Chyba při načítání servisních požadavků:', error);
    throw error;
  }
};

export const updateServiceRequestStatus = async (id, status, notes = null) => {
  try {
    const updateData = { status };
    if (notes) {
      updateData.notes = notes;
    }
    
    const response = await api.put(`/service-requests/${id}/status`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Chyba při aktualizaci stavu servisního požadavku ${id}:`, error);
    throw error;
  }
};
