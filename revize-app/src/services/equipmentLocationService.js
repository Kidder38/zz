// Service pro správu historie umístění jeřábů
import api from './api';
import { getProjects } from './projectService';

// Získat historii umístění pro zařízení
export const getEquipmentLocationHistory = async (equipmentId) => {
  try {
    // Pro development používáme mock data
    const mockHistory = [
      {
        id: 1,
        equipment_id: parseInt(equipmentId),
        location_id: 2,
        location_name: 'Stavba - Wenceslas Square',
        location_type: 'construction_site',
        
        // Časové údaje
        installed_date: '2024-01-15',
        planned_removal_date: '2024-06-30',
        actual_removal_date: null, // Stále tam
        
        // Stavy
        status_on_arrival: 'in_transport',
        status_on_departure: null,
        
        // Odpovědné osoby
        responsible_person_id: 4,
        responsible_person_name: 'Jan Novák',
        site_manager_id: null,
        site_manager_name: null,
        
        // Montáž a revize
        montage_completion_date: '2024-01-18',
        revision_after_montage_date: '2024-01-19',
        revision_before_demontage_date: null,
        
        // Provozní údaje
        operating_hours_start: 1156.0,
        operating_hours_end: null,
        current_operating_hours: 1247.5,
        
        notes: 'Montáž proběhla bez komplikací, revize úspěšná',
        created_at: '2024-01-10T10:00:00',
        
        // Kontaktní údaje lokace
        contact_person: 'Petr Stavitel',
        contact_phone: '+420 602 345 678',
        address: 'Václavské náměstí, Praha 1',
        
        // GPS souřadnice
        gps_latitude: 50.0813,
        gps_longitude: 14.4306
      },
      {
        id: 2,
        equipment_id: parseInt(equipmentId),
        location_id: 1,
        location_name: 'Hlavní sklad',
        location_type: 'warehouse',
        
        installed_date: '2023-10-01',
        planned_removal_date: '2024-01-15',
        actual_removal_date: '2024-01-15',
        
        status_on_arrival: 'stored',
        status_on_departure: 'in_transport',
        
        responsible_person_id: null,
        responsible_person_name: null,
        site_manager_id: null,
        site_manager_name: null,
        
        operating_hours_start: 1156.0,
        operating_hours_end: 1156.0, // Žádné hodiny ve skladu
        
        notes: 'Skladování po dokončení předchozí stavby',
        created_at: '2023-09-25T14:30:00',
        
        contact_person: 'Jan Skladník',
        contact_phone: '+420 601 234 567',
        address: 'Průmyslová 123, Praha 10'
      },
      {
        id: 3,
        equipment_id: parseInt(equipmentId),
        location_id: 3,
        location_name: 'Stavba - Previous Site',
        location_type: 'construction_site',
        
        installed_date: '2023-03-01',
        planned_removal_date: '2023-09-30',
        actual_removal_date: '2023-09-28',
        
        status_on_arrival: 'mounting',
        status_on_departure: 'dismounting',
        
        responsible_person_id: 3,
        responsible_person_name: 'Petr Technický',
        site_manager_id: null,
        site_manager_name: null,
        
        montage_completion_date: '2023-03-05',
        revision_after_montage_date: '2023-03-06',
        revision_before_demontage_date: '2023-09-27',
        
        operating_hours_start: 950.0,
        operating_hours_end: 1156.0,
        
        notes: 'Úspěšně dokončený projekt, demontáž bez problémů',
        created_at: '2023-02-20T09:00:00',
        
        contact_person: 'Ing. Novák',
        contact_phone: '+420 605 123 456',
        address: 'Náměstí Svobody, Praha 6',
        
        // GPS souřadnice
        gps_latitude: 50.1037,
        gps_longitude: 14.3894
      }
    ];

    // Simulace API zpoždění
    await new Promise(resolve => setTimeout(resolve, 250));

    // Filtrujeme podle equipment_id a řadíme podle data (nejnovější první)
    const filtered = mockHistory
      .filter(h => h.equipment_id === parseInt(equipmentId))
      .sort((a, b) => new Date(b.installed_date) - new Date(a.installed_date));

    return filtered;
  } catch (error) {
    console.error(`Chyba při načítání historie umístění pro zařízení ${equipmentId}:`, error);
    throw { error: 'Došlo k chybě při načítání historie umístění' };
  }
};

// Získat aktuální umístění zařízení (STARÉ - pro zpětnou kompatibilitu)
export const getCurrentLocation = async (equipmentId) => {
  try {
    const history = await getEquipmentLocationHistory(equipmentId);
    
    // Najdeme záznam, který nemá actual_removal_date (aktuální umístění)
    const currentLocation = history.find(h => h.actual_removal_date === null);
    
    if (!currentLocation) {
      // Pokud není aktuální umístění, jeřáb je pravděpodobně ve skladu nebo v přepravě
      return {
        status: 'unknown',
        message: 'Aktuální umístění není evidováno'
      };
    }

    return currentLocation;
  } catch (error) {
    console.error(`Chyba při načítání aktuálního umístění pro zařízení ${equipmentId}:`, error);
    throw { error: 'Došlo k chybě při načítání aktuálního umístění' };
  }
};

// NOVÁ LOGIKA - Získat aktuální stavbu pro jeřáb
export const getCurrentProject = async (equipmentId) => {
  try {
    // Načteme všechny projekty
    const projects = await getProjects();
    
    // Najdeme projekt, který má přiřazený tento jeřáb
    const currentProject = projects.find(project => 
      project.assigned_equipment && 
      project.assigned_equipment.some(eq => eq.equipment_id === parseInt(equipmentId))
    );
    
    if (!currentProject) {
      return {
        status: 'no_project',
        message: 'Jeřáb není přiřazen k žádné stavbě',
        location_name: 'Sklad / Nepřiřazen',
        location_type: 'warehouse'
      };
    }

    // Najdeme konkrétní přiřazení jeřábu v projektu
    const equipmentAssignment = currentProject.assigned_equipment.find(
      eq => eq.equipment_id === parseInt(equipmentId)
    );
    
    // Vrátíme informace kompatibilní se starým formátem
    return {
      // Informace o projektu
      project_id: currentProject.id,
      project_name: currentProject.name,
      project_number: currentProject.project_number,
      project_status: currentProject.status,
      
      // Lokace (z projektu)
      location_name: currentProject.name,
      location_type: 'construction_site',
      address: currentProject.location.address,
      contact_person: currentProject.site_manager || currentProject.project_manager,
      
      // Přiřazení jeřábu
      assigned_date: equipmentAssignment?.assigned_date,
      planned_removal_date: equipmentAssignment?.planned_removal_date,
      operator_name: equipmentAssignment?.operator_name,
      
      // GPS souřadnice
      gps_latitude: currentProject.location.gps_latitude,
      gps_longitude: currentProject.location.gps_longitude,
      
      // Kompatibilita se starým formátem
      id: currentProject.id,
      equipment_id: parseInt(equipmentId),
      installed_date: equipmentAssignment?.assigned_date,
      actual_removal_date: null, // Aktivní přiřazení
      responsible_person_name: currentProject.project_manager
    };
  } catch (error) {
    console.error(`Chyba při načítání aktuální stavby pro zařízení ${equipmentId}:`, error);
    throw { error: 'Došlo k chybě při načítání aktuální stavby' };
  }
};

// Přesunout zařízení na novou lokaci
export const moveEquipment = async (equipmentId, moveData) => {
  try {
    // moveData obsahuje:
    // - new_location_id
    // - planned_removal_date (z aktuální lokace)
    // - planned_installation_date (na novou lokaci)
    // - responsible_person_id
    // - notes
    
    // V produkci by se poslalo na API
    // const response = await api.post(`/equipment/${equipmentId}/move`, moveData);
    // return response.data;

    // Pro development simulujeme úspěšný přesun
    const moveResult = {
      equipment_id: parseInt(equipmentId),
      old_location_closed: true,
      new_location_created: true,
      planned_move_date: moveData.planned_installation_date,
      status: 'move_planned',
      message: 'Přesun jeřábu byl úspěšně naplánován'
    };

    await new Promise(resolve => setTimeout(resolve, 400));
    return moveResult;
  } catch (error) {
    console.error(`Chyba při plánování přesunu zařízení ${equipmentId}:`, error);
    throw error.response?.data || { error: 'Došlo k chybě při plánování přesunu' };
  }
};

// Dokončit montáž na lokaci
export const completeMontage = async (equipmentId, montageData) => {
  try {
    // montageData obsahuje:
    // - montage_completion_date
    // - revision_after_montage_date
    // - operating_hours_start
    // - notes
    
    const result = {
      equipment_id: parseInt(equipmentId),
      montage_completed: true,
      revision_scheduled: true,
      new_status: 'operational',
      message: 'Montáž byla úspěšně dokončena'
    };

    await new Promise(resolve => setTimeout(resolve, 300));
    return result;
  } catch (error) {
    console.error(`Chyba při dokončování montáže pro zařízení ${equipmentId}:`, error);
    throw error.response?.data || { error: 'Došlo k chybě při dokončování montáže' };
  }
};

// Dokončit demontáž z lokace
export const completeDemontage = async (equipmentId, demontageData) => {
  try {
    // demontageData obsahuje:
    // - actual_removal_date
    // - revision_before_demontage_date
    // - operating_hours_end
    // - status_on_departure
    // - notes
    
    const result = {
      equipment_id: parseInt(equipmentId),
      demontage_completed: true,
      location_closed: true,
      new_status: demontageData.status_on_departure || 'in_transport',
      message: 'Demontáž byla úspěšně dokončena'
    };

    await new Promise(resolve => setTimeout(resolve, 350));
    return result;
  } catch (error) {
    console.error(`Chyba při dokončování demontáže pro zařízení ${equipmentId}:`, error);
    throw error.response?.data || { error: 'Došlo k chybě při dokončování demontáže' };
  }
};

// Získat přehled všech jeřábů s aktuálním umístěním
export const getAllEquipmentLocations = async (params = {}) => {
  try {
    // Importujeme služby pro načtení skutečných dat
    const { getEquipment } = await import('./equipmentService');
    const { getLocations } = await import('./locationService');
    
    // Načteme skutečná zařízení a lokace
    const [equipmentList, locationsList] = await Promise.all([
      getEquipment(),
      getLocations()
    ]);

    // Vytvoříme mapu lokací pro rychlé vyhledávání
    const locationsMap = new Map(locationsList.map(loc => [loc.id, loc]));
    
    // Kombinujeme data zařízení s informacemi o lokacích
    const equipmentWithLocations = equipmentList.map(equipment => {
      // Pokusíme se najít lokaci podle current_location_id (pokud existuje)
      const location = equipment.current_location_id ? 
        locationsMap.get(equipment.current_location_id) : null;
      
      // Výchozí lokace pokud není žádná přiřazena
      const defaultLocation = {
        location_name: 'Nepřiřazeno',
        location_type: 'warehouse',
        contact_person: null
      };
      
      const currentLocation = location || defaultLocation;
      
      // Simulujeme kontroly a upozornění
      const today = new Date();
      const lastRevision = equipment.last_revision_date ? new Date(equipment.last_revision_date) : null;
      const nextRevision = equipment.next_revision_date ? new Date(equipment.next_revision_date) : null;
      
      // Výpočet upozornění
      const daysSinceLastRevision = lastRevision ? 
        Math.floor((today - lastRevision) / (1000 * 60 * 60 * 24)) : null;
      const daysToNextRevision = nextRevision ? 
        Math.floor((nextRevision - today) / (1000 * 60 * 60 * 24)) : null;
      
      const alerts = {
        daily_control_missing: equipment.current_status === 'operational' && 
          Math.random() > 0.7, // Simulace chybějící denní kontroly
        revision_due_soon: daysToNextRevision !== null && daysToNextRevision <= 30,
        maintenance_required: daysSinceLastRevision !== null && daysSinceLastRevision > 365
      };
      
      return {
        equipment_id: equipment.id,
        equipment_type: equipment.equipment_type,
        manufacturer: equipment.manufacturer,
        model: equipment.model,
        serial_number: equipment.serial_number,
        current_status: equipment.current_status || 'stored',
        
        current_location_id: equipment.current_location_id || null,
        current_location_name: currentLocation.location_name,
        current_location_type: currentLocation.location_type,
        installed_since: equipment.installation_date || equipment.created_at,
        planned_removal: null, // TODO: Implement planned removal tracking
        
        responsible_person: currentLocation.contact_person,
        operating_hours: equipment.operating_hours || 0,
        last_control_date: equipment.last_control_date || 
          (equipment.current_status === 'operational' ? 
            new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
            null),
        
        alerts: alerts
      };
    });

    // Aplikovat filtry
    let filtered = equipmentWithLocations;
    if (params.status) {
      filtered = filtered.filter(eq => eq.current_status === params.status);
    }
    if (params.location_type) {
      filtered = filtered.filter(eq => eq.current_location_type === params.location_type);
    }
    if (params.has_alerts) {
      filtered = filtered.filter(eq => 
        eq.alerts.daily_control_missing || 
        eq.alerts.revision_due_soon || 
        eq.alerts.maintenance_required
      );
    }

    await new Promise(resolve => setTimeout(resolve, 200));
    return filtered;
  } catch (error) {
    console.error('Chyba při načítání přehledu umístění zařízení:', error);
    throw { error: 'Došlo k chybě při načítání přehledu umístění' };
  }
};

// Helper funkce pro stavy zařízení
export const getEquipmentStatuses = () => {
  return [
    { value: 'stored', label: 'Skladem', color: 'gray', icon: '📦' },
    { value: 'in_transport', label: 'V přepravě', color: 'blue', icon: '🚛' },
    { value: 'mounting', label: 'Montáž', color: 'yellow', icon: '🏗️' },
    { value: 'operational', label: 'V provozu', color: 'green', icon: '✅' },
    { value: 'dismounting', label: 'Demontáž', color: 'orange', icon: '🔧' },
    { value: 'maintenance', label: 'Údržba', color: 'purple', icon: '🛠️' },
    { value: 'retired', label: 'Vyřazeno', color: 'red', icon: '❌' }
  ];
};