// Service pro správu staveb/zakázek a přiřazování jeřábů
import api from './api';
import { getEquipment } from './equipmentService';

// Pomocné funkce pro stavy a priority
export const getProjectStatuses = () => {
  return [
    { value: 'planned', label: 'Plánovaná', color: 'gray', icon: '📋' },
    { value: 'active', label: 'Aktivní', color: 'green', icon: '🚧' },
    { value: 'on_hold', label: 'Pozastavená', color: 'yellow', icon: '⏸️' },
    { value: 'completed', label: 'Dokončená', color: 'blue', icon: '✅' },
    { value: 'cancelled', label: 'Zrušená', color: 'red', icon: '❌' }
  ];
};

export const getProjectPriorities = () => {
  return [
    { value: 'low', label: 'Nízká', color: 'gray', icon: '🔽' },
    { value: 'medium', label: 'Střední', color: 'blue', icon: '➖' },
    { value: 'high', label: 'Vysoká', color: 'yellow', icon: '🔼' },
    { value: 'critical', label: 'Kritická', color: 'red', icon: '🚨' }
  ];
};

// Získat všechny stavby/zakázky
export const getProjects = async (params = {}) => {
  try {
    const response = await api.get('/projects', { params });
    return response.data;
  } catch (error) {
    console.error('Chyba při načítání staveb:', error);
    throw { error: 'Došlo k chybě při načítání staveb' };
  }
};


// Získat detail stavby
export const getProject = async (id) => {
  try {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při načítání stavby ${id}:`, error);
    if (error.response?.status === 404) {
      throw { error: 'Stavba nenalezena' };
    }
    throw { error: 'Došlo k chybě při načítání stavby' };
  }
};

// Vytvořit novou stavbu
export const createProject = async (projectData) => {
  try {
    const response = await api.post('/projects', {
      ...projectData,
      status: 'planned'
    });
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření stavby:', error);
    throw error.response?.data || { error: 'Došlo k chybě při vytváření stavby' };
  }
};

// Přiřadit jeřáb ke stavbě
export const assignEquipmentToProject = async (projectId, equipmentAssignment) => {
  try {
    // equipmentAssignment obsahuje:
    // - equipment_id
    // - assigned_date (datum nasazení)
    // - planned_removal_date (plánovaný konec)
    // - operator_id (přiřazený operátor)
    // - operator_name
    // - notes
    
    const response = await api.post(`/projects/${projectId}/equipment`, {
      equipment_id: parseInt(equipmentAssignment.equipment_id),
      assigned_date: equipmentAssignment.assigned_date,
      planned_removal_date: equipmentAssignment.planned_removal_date,
      operator_id: equipmentAssignment.operator_id,
      operator_name: equipmentAssignment.operator_name,
      notes: equipmentAssignment.notes
    });
    return response.data;
  } catch (error) {
    console.error(`Chyba při přiřazování jeřábu ke stavbě ${projectId}:`, error);
    throw error.response?.data || { error: 'Došlo k chybě při přiřazování jeřábu' };
  }
};

// Aktualizovat stavbu
export const updateProject = async (projectId, projectData) => {
  try {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  } catch (error) {
    console.error(`Chyba při aktualizaci stavby ${projectId}:`, error);
    throw error.response?.data || { error: 'Došlo k chybě při aktualizaci stavby' };
  }
};

// Smazat stavbu
export const deleteProject = async (projectId) => {
  try {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error(`Chyba při mazání stavby ${projectId}:`, error);
    throw error.response?.data || { error: 'Došlo k chybě při mazání stavby' };
  }
};

// Odebrat jeřáb ze stavby
export const removeEquipmentFromProject = async (projectId, equipmentId, removalData) => {
  try {
    // removalData obsahuje:
    // - actual_removal_date
    // - notes
    
    const response = await api.delete(`/projects/${projectId}/equipment/${equipmentId}`, {
      data: {
        actual_removal_date: removalData.actual_removal_date,
        notes: removalData.notes
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Chyba při odebírání jeřábu ze stavby ${projectId}:`, error);
    throw error.response?.data || { error: 'Došlo k chybě při odebírání jeřábu' };
  }
};

// Získat dostupné jeřáby pro přiřazení
export const getAvailableEquipmentForProject = async (projectStartDate, projectEndDate) => {
  try {
    // Načteme všechna zařízení
    const allEquipment = await getEquipment();
    
    // Načteme všechny projekty k zjištění, které jeřáby jsou už přiřazené
    const allProjects = await getProjects();
    
    // Najdeme ID všech aktuálně přiřazených jeřábů
    const assignedEquipmentIds = new Set();
    allProjects.forEach(project => {
      if (project.assigned_equipment) {
        project.assigned_equipment.forEach(eq => {
          assignedEquipmentIds.add(eq.equipment_id);
        });
      }
    });

    // Filtrujeme pouze volné jeřáby
    const availableEquipment = allEquipment
      .filter(equipment => !assignedEquipmentIds.has(equipment.id))
      .map(equipment => ({
        id: equipment.id,
        equipment_type: equipment.equipment_type || 'Jeřáb',
        manufacturer: equipment.manufacturer,
        model: equipment.model,
        serial_number: equipment.serial_number,
        current_status: assignedEquipmentIds.has(equipment.id) ? 'assigned' : 'available',
        current_location: 'Sklad / Volný',
        operating_hours: equipment.operating_hours || 0,
        last_revision_date: equipment.last_revision_date || 'Neuvedeno',
        available: true,
        availability_note: `Volný jeřáb připravený k přiřazení`
      }));

    await new Promise(resolve => setTimeout(resolve, 200));
    return availableEquipment;
  } catch (error) {
    console.error('Chyba při načítání dostupných jeřábů:', error);
    throw { error: 'Došlo k chybě při načítání dostupných jeřábů' };
  }
};

