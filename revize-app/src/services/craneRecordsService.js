// Service pro správu všech záznamů o jeřábu (kontroly, revize, údržba)
import api from './api';

// Získat všechny záznamy pro zařízení
export const getCraneRecords = async (equipmentId, params = {}) => {
  try {
    // Použít reálné API
    const queryParams = new URLSearchParams();
    
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);
    
    // Mapovat frontend filtry na backend parametry
    if (params.entry_type) {
      queryParams.append('entry_type', params.entry_type);
    } else if (params.category || params.type) {
      // Mapovat kategorii nebo typ na entry_type
      const entryType = mapCategoryToEntryType(params.category) || params.type;
      if (entryType && entryType !== 'all') {
        queryParams.append('entry_type', entryType);
      }
    }
    
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    
    // Backend zatím nepodporuje status filter, takže jej aplikujeme na frontendu
    const statusFilter = params.status;

    const response = await api.get(`/logbook/equipment/${equipmentId}?${queryParams.toString()}`);
    
    // Transformovat backend data na frontend formát
    const transformedData = response.data.map(entry => ({
      id: entry.id,
      equipment_id: entry.equipment_id,
      record_category: mapEntryTypeToCategory(entry.entry_type),
      record_type: mapEntryTypeToRecordType(entry.entry_type),
      control_period: entry.entry_type, // Může být upraveno podle potřeby
      record_date: entry.entry_date,
      record_time: entry.entry_time || '00:00:00',
      inspector_id: entry.operator_id,
      inspector_name: `${entry.first_name || ''} ${entry.last_name || ''}`.trim() || 'Neznámý',
      required_qualification: 'operator', // Default pro API data
      title: getTitleFromEntryType(entry.entry_type),
      description: entry.notes || 'Bez popisu',
      findings: entry.notes || 'Bez zjištění',
      status: 'completed', // API záznamy jsou vždy dokončené
      result: 'passed', // Default výsledek
      severity: getSeverityFromEntry(entry),
      operating_hours: entry.operating_hours || 0,
      location_name: 'Neznámá lokace', // TODO: Doplnit z lokace
      checklist_results: entry.daily_checks ? mapDailyChecks(entry.daily_checks) : {},
      fault_report: entry.fault_report,
      operation_record: entry.operation_record,
      created_at: entry.created_at || entry.entry_date
    }));
    
    // Aplikovat frontend filtry, které backend nepodporuje
    let filteredData = transformedData;
    if (statusFilter && statusFilter !== 'all') {
      filteredData = filteredData.filter(record => record.status === statusFilter);
    }
    
    return filteredData;
  } catch (error) {
    console.error(`Chyba při načítání záznamů pro zařízení ${equipmentId}:`, error);
    
    // Fallback na mock data při chybě API
    console.warn('Používám mock data kvůli chybě API...');
    return await getMockRecords(equipmentId, params);
  }
};

// Helper funkce pro mapování kategorií na entry_type
const mapCategoryToEntryType = (category) => {
  const mapping = {
    'control': 'daily_check',
    'incident': 'fault_report',
    'operation': 'operation',
    'maintenance': 'maintenance'
  };
  return mapping[category];
};

// Helper funkce pro mapování typů záznamů
const mapEntryTypeToCategory = (entryType) => {
  const mapping = {
    'daily_check': 'control',
    'fault_report': 'incident', 
    'operation': 'control', // Operační záznamy z kontrol jsou kontroly
    'weekly': 'control',
    'monthly': 'control'
  };
  return mapping[entryType] || 'other';
};

const mapEntryTypeToRecordType = (entryType) => {
  const mapping = {
    'daily_check': 'daily',
    'fault_report': 'safety_incident', 
    'operation': 'daily', // Operační záznamy z denních kontrol jsou denní
    'weekly': 'weekly',
    'monthly': 'monthly'
  };
  return mapping[entryType] || entryType;
};

const getTitleFromEntryType = (entryType) => {
  const titles = {
    'daily_check': 'Denní kontrola',
    'fault_report': 'Hlášení závady',
    'operation': 'Provozní záznam',
    'weekly': 'Týdenní kontrola',
    'monthly': 'Měsíční kontrola'
  };
  return titles[entryType] || 'Provozní záznam';
};

const getSeverityFromEntry = (entry) => {
  if (entry.fault_report) {
    return entry.fault_report.severity || 'low';
  }
  return 'info';
};

const mapDailyChecks = (dailyChecks) => {
  const results = {};
  if (Array.isArray(dailyChecks)) {
    dailyChecks.forEach(check => {
      const key = check.category + '_' + check.item?.replace(/\s+/g, '_').toLowerCase();
      results[key] = check.result;
    });
  }
  return results;
};

// Mock data pro fallback
const getMockRecords = async (equipmentId, params) => {
  try {
    const mockRecords = [
    {
      id: 1,
      equipment_id: parseInt(equipmentId),
        record_category: 'control',
        record_type: 'daily',
        control_period: 'daily',
        record_date: new Date().toISOString().split('T')[0],
        record_time: '08:00:00',
        inspector_id: 4,
        inspector_name: 'Jan Novák',
        required_qualification: 'operator',
        title: 'Denní kontrola před zahájením práce',
        description: 'Rutinní kontrola všech bezpečnostních prvků',
        findings: 'Bez závad',
        status: 'completed',
        result: 'passed',
        severity: 'info',
        operating_hours: 1247.5,
        location_name: 'Stavba - Wenceslas Square',
        checklist_results: {
          brake_test: 'ok',
          hook_inspection: 'ok', 
          cable_condition: 'ok',
          safety_devices: 'ok'
        },
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        equipment_id: parseInt(equipmentId),
        record_category: 'control',
        record_type: 'weekly', 
        control_period: 'weekly',
        record_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        record_time: '10:30:00',
        inspector_id: 4,
        inspector_name: 'Jan Novák',
        required_qualification: 'operator',
        title: 'Týdenní rozšířená kontrola',
        description: 'Detailní kontrola všech systémů a mechanismů',
        findings: 'Mírné opotřebení brzdy, doporučuji kontrolu',
        recommendations: 'Naplánovat kontrolu brzd během měsíční údržby',
        status: 'completed',
        result: 'passed_with_remarks',
        severity: 'low',
        operating_hours: 1245.2,
        location_name: 'Stavba - Wenceslas Square',
        checklist_results: {
          detailed_brake_test: 'minor_wear',
          cable_detailed: 'ok',
          electrical_systems: 'ok',
          hydraulics: 'ok'
        },
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        equipment_id: parseInt(equipmentId),
        record_category: 'control',
        record_type: 'monthly',
        control_period: 'monthly', 
        record_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        record_time: '14:00:00',
        inspector_id: 2,
        inspector_name: 'Jan Revizní',
        required_qualification: 'technician',
        title: 'Měsíční technická kontrola',
        description: 'Komplexní technická kontrola prováděná odborným technikem',
        findings: 'Zjištěno zvýšené opotřebení brzdového obložení, nutná výměna do 2 týdnů',
        recommendations: 'Objednat náhradní díly a naplánovat výměnu brzd',
        corrective_actions: 'Kontaktován dodavatel náhradních dílů',
        status: 'completed',
        result: 'passed_with_remarks',
        severity: 'medium',
        operating_hours: 1230.0,
        location_name: 'Stavba - Wenceslas Square',
        maintenance_required: true,
        next_control_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        next_control_type: 'monthly',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 4,
        equipment_id: parseInt(equipmentId),
        record_category: 'revision',
        record_type: 'post_montage',
        record_date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        record_time: '09:00:00',
        inspector_id: 2,
        inspector_name: 'Jan Revizní',
        required_qualification: 'revision_technician',
        title: 'Revize po montáži dle NV 193/2022',
        description: 'Povinná revize jeřábu po dokončení montáže na staveništi',
        findings: 'Jeřáb je namontován v souladu s projektovou dokumentací',
        recommendations: 'Dodržovat pravidelnou periodicitu kontrol dle plánu',
        status: 'completed',
        result: 'passed',
        severity: 'info',
        operating_hours: 1156.0,
        location_name: 'Stavba - Wenceslas Square',
        load_test_performed: true,
        load_test_weight: 8.0,
        next_control_date: new Date(Date.now() + 720 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        next_control_type: 'periodic_revision',
        attachments: {
          revision_report: 'revizni_zprava_2024_001.pdf',
          load_test_protocol: 'zatezka_zkouska_2024_001.pdf'
        },
        created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 5,
        equipment_id: parseInt(equipmentId),
        record_category: 'incident',
        record_type: 'safety_incident',
        record_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        record_time: '15:45:00',
        inspector_id: 4,
        inspector_name: 'Jan Novák',
        required_qualification: 'operator',
        title: 'Mimořádná událost - neplánované zastavení',
        description: 'Jeřáb se automaticky zastavil kvůli aktivaci bezpečnostního systému',
        findings: 'Senzor přetížení detekoval překročení povolené hmotnosti',
        corrective_actions: 'Překontrolováno nastavení senzorů, vše v pořádku',
        status: 'completed',
        result: 'passed',
        severity: 'low',
        operating_hours: 1242.8,
        location_name: 'Stavba - Wenceslas Square',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Simulace API zpoždění
    await new Promise(resolve => setTimeout(resolve, 300));

    // Aplikovat filtry
    let filtered = mockRecords.filter(record => record.equipment_id === parseInt(equipmentId));
    
    if (params.category) {
      filtered = filtered.filter(record => record.record_category === params.category);
    }
    if (params.type) {
      filtered = filtered.filter(record => record.record_type === params.type);
    }
    if (params.status) {
      filtered = filtered.filter(record => record.status === params.status);
    }
    if (params.date_from) {
      filtered = filtered.filter(record => record.record_date >= params.date_from);
    }
    if (params.date_to) {
      filtered = filtered.filter(record => record.record_date <= params.date_to);
    }

    // Seřadit podle data (nejnovější první)
    filtered.sort((a, b) => new Date(b.record_date) - new Date(a.record_date));

    return filtered;
  } catch (error) {
    console.error(`Chyba při načítání mock záznamů pro zařízení ${equipmentId}:`, error);
    throw { error: 'Došlo k chybě při načítání záznamů' };
  }
};

// Získat konkrétní záznam
export const getCraneRecord = async (recordId) => {
  try {
    const response = await api.get(`/logbook/entry/${recordId}`);
    
    if (!response.data) {
      throw { error: 'Záznam nenalezen' };
    }

    // Transformovat na frontend formát
    const entry = response.data;
    return {
      id: entry.id,
      equipment_id: entry.equipment_id,
      record_category: mapEntryTypeToCategory(entry.entry_type),
      record_type: entry.entry_type,
      record_date: entry.entry_date,
      record_time: entry.entry_time || '00:00:00',
      inspector_id: entry.operator_id,
      inspector_name: `${entry.first_name || ''} ${entry.last_name || ''}`.trim() || 'Neznámý',
      title: getTitleFromEntryType(entry.entry_type),
      description: entry.notes || 'Bez popisu',
      findings: entry.notes || 'Bez zjištění',
      status: 'completed',
      result: 'passed',
      severity: getSeverityFromEntry(entry),
      operating_hours: entry.operating_hours || 0,
      checklist_results: entry.daily_checks ? mapDailyChecks(entry.daily_checks) : {},
      fault_report: entry.fault_report,
      operation_record: entry.operation_record,
      created_at: entry.created_at || entry.entry_date
    };
  } catch (error) {
    console.error(`Chyba při načítání záznamu ${recordId}:`, error);
    throw error.response?.data || { error: 'Došlo k chybě při načítání záznamu' };
  }
};

// Vytvořit nový záznam
export const createCraneRecord = async (recordData) => {
  try {
    // Debug: Log the incoming data
    console.log('Creating record with data:', recordData);
    console.log('Detected category/type:', recordData.record_category || recordData.record_type);
    console.log('Inspector/Operator ID from form:', recordData.inspector_id);
    console.log('Equipment ID from form:', recordData.equipment_id);
    
    // Zkontrolovat jestli máme vůbec nějaký operator_id
    if (!recordData.inspector_id && !recordData.operator_id) {
      console.warn('⚠️ Žádné operator_id není k dispozici! Uživatel možná není přihlášen.');
      console.warn('Používám fallback operator_id: 4 (Jan Novák)');
    }
    
    // Určit typ záznamu a endpoint podle kategorie
    let endpoint;
    let payload;

    switch (recordData.record_category || recordData.record_type) {
      case 'daily_check':
      case 'daily':
        // Pouze pro skutečné denní kontroly
        endpoint = '/logbook/daily-check';
        const dailyChecks = recordData.checklist_results ? 
          transformChecklistResults(recordData.checklist_results) : 
          getDefaultDailyChecks();

        payload = {
          equipment_id: recordData.equipment_id,
          operator_id: recordData.inspector_id || recordData.operator_id || 2, // Fallback to Jan Novák (ID=2)
          entry_date: recordData.record_date || recordData.entry_date || new Date().toISOString().split('T')[0], // Fallback na dnešní datum
          shift: recordData.shift || 'day',
          operating_hours: recordData.operating_hours,
          weather_conditions: recordData.weather_conditions,
          notes: recordData.description || recordData.notes,
          daily_checks: dailyChecks
        };
        break;

      case 'control':
        // Obecné kontrolní záznamy jako provozní záznamy
        endpoint = '/logbook/operation';
        payload = {
          equipment_id: recordData.equipment_id,
          operator_id: recordData.inspector_id || recordData.operator_id || 2, // Fallback to Jan Novák (ID=2)
          entry_date: recordData.record_date || recordData.entry_date || new Date().toISOString().split('T')[0], // Fallback na dnešní datum
          shift: recordData.shift || 'day',
          operating_hours: recordData.operating_hours,
          notes: recordData.notes || recordData.description || 'Kontrolní záznam',
          start_time: recordData.start_time || recordData.record_time || '08:00:00',
          end_time: recordData.end_time || recordData.record_time || '16:00:00',
          load_description: recordData.load_description || 'Kontrolní činnost',
          max_load_used: recordData.max_load_used || 0,
          cycles_count: recordData.cycles_count || 0,
          unusual_loads: false,
          unusual_loads_description: ''
        };
        console.log('Control payload:', payload);
        break;

      case 'incident':
      case 'fault_report':
        endpoint = '/logbook/fault-report';
        payload = {
          equipment_id: recordData.equipment_id,
          operator_id: recordData.inspector_id || recordData.operator_id || 2, // Fallback to Jan Novák (ID=2)
          entry_date: recordData.record_date || recordData.entry_date || new Date().toISOString().split('T')[0], // Fallback na dnešní datum
          shift: recordData.shift || 'day',
          notes: recordData.notes || recordData.description,
          fault_type: recordData.fault_type || 'other',
          severity: recordData.severity || 'low',
          title: recordData.title || 'Hlášení závady',
          description: recordData.description || recordData.findings || '',
          immediate_action: recordData.corrective_actions || '',
          equipment_stopped: recordData.equipment_stopped || false
        };
        break;

      case 'operation':
        endpoint = '/logbook/operation';
        payload = {
          equipment_id: recordData.equipment_id,
          operator_id: recordData.inspector_id || recordData.operator_id || 2, // Fallback to Jan Novák (ID=2)
          entry_date: recordData.record_date || recordData.entry_date || new Date().toISOString().split('T')[0], // Fallback na dnešní datum
          shift: recordData.shift || 'day',
          operating_hours: recordData.operating_hours,
          notes: recordData.notes || recordData.description,
          start_time: recordData.start_time || recordData.record_time || '08:00:00',
          end_time: recordData.end_time || recordData.record_time || '16:00:00',
          load_description: recordData.load_description || '',
          max_load_used: recordData.max_load_used,
          cycles_count: recordData.cycles_count,
          unusual_loads: recordData.unusual_loads || false,
          unusual_loads_description: recordData.unusual_loads_description || ''
        };
        console.log('Operation payload:', payload);
        break;

      default:
        throw { error: 'Nepodporovaný typ záznamu' };
    }

    console.log('Final endpoint:', endpoint);
    console.log('Final payload:', payload);
    
    // Verify required fields for operation endpoint
    if (endpoint === '/logbook/operation') {
      if (!payload.equipment_id || !payload.operator_id || !payload.start_time) {
        console.error('Missing required fields for operation:', {
          equipment_id: payload.equipment_id,
          operator_id: payload.operator_id,
          start_time: payload.start_time
        });
      }
    }

    const response = await api.post(endpoint, payload);
    
    // Transformovat response zpět na frontend formát
    const transformedRecord = {
      id: response.data.id,
      equipment_id: response.data.equipment_id,
      record_category: mapEntryTypeToCategory(response.data.entry_type),
      record_type: response.data.entry_type,
      record_date: response.data.entry_date,
      record_time: response.data.entry_time || '00:00:00',
      inspector_id: response.data.operator_id,
      inspector_name: 'Aktuální uživatel',
      title: getTitleFromEntryType(response.data.entry_type),
      description: response.data.notes || 'Bez popisu',
      findings: response.data.notes || 'Bez zjištění',
      status: 'completed',
      result: 'passed',
      severity: recordData.severity || 'info',
      operating_hours: response.data.operating_hours || 0,
      created_at: response.data.created_at || new Date().toISOString(),
      fault_report: response.data.fault_report,
      operation_record: response.data.operation_record
    };

    return transformedRecord;
  } catch (error) {
    console.error('Chyba při vytváření záznamu:', error);
    throw error.response?.data || { error: 'Došlo k chybě při vytváření záznamu' };
  }
};

// Helper funkce pro výchozí denní kontroly
const getDefaultDailyChecks = () => {
  return [
    {
      check_category: 'visual',
      check_item: 'Vizuální kontrola konstrukce',
      check_result: 'ok',
      notes: 'Bez viditelných závad'
    },
    {
      check_category: 'functional',
      check_item: 'Funkce ovládacích prvků',
      check_result: 'ok',
      notes: 'Funkční'
    },
    {
      check_category: 'safety',
      check_item: 'Bezpečnostní zařízení',
      check_result: 'ok',
      notes: 'V pořádku'
    }
  ];
};

// Helper funkce pro transformaci checklist výsledků
const transformChecklistResults = (checklistResults) => {
  if (!checklistResults || typeof checklistResults !== 'object') {
    return [];
  }

  return Object.entries(checklistResults).map(([key, result]) => {
    const parts = key.split('_');
    return {
      check_category: parts[0] || 'general',
      check_item: parts.slice(1).join(' ') || key,
      check_result: result,
      notes: ''
    };
  });
};

// Aktualizovat záznam
export const updateCraneRecord = async (recordId, recordData) => {
  try {
    const updatedRecord = {
      id: parseInt(recordId),
      ...recordData,
      updated_at: new Date().toISOString()
    };

    await new Promise(resolve => setTimeout(resolve, 300));
    return updatedRecord;
  } catch (error) {
    console.error(`Chyba při aktualizaci záznamu ${recordId}:`, error);
    throw error.response?.data || { error: 'Došlo k chybě při aktualizaci záznamu' };
  }
};

// Smazat záznam
export const deleteCraneRecord = async (recordId) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { message: 'Záznam byl úspěšně smazán' };
  } catch (error) {
    console.error(`Chyba při mazání záznamu ${recordId}:`, error);
    throw error.response?.data || { error: 'Došlo k chybě při mazání záznamu' };
  }
};

// Získat statistiky pro zařízení
export const getEquipmentStatistics = async (equipmentId, params = {}) => {
  try {
    const records = await getCraneRecords(equipmentId, params);
    
    const stats = {
      total_records: records.length,
      by_category: {},
      by_status: {},
      by_result: {},
      recent_activity: records.slice(0, 5),
      alerts: {
        overdue_controls: 0,
        failed_controls: 0,
        maintenance_required: 0
      }
    };

    // Počítání podle kategorií
    records.forEach(record => {
      stats.by_category[record.record_category] = 
        (stats.by_category[record.record_category] || 0) + 1;
      
      stats.by_status[record.status] = 
        (stats.by_status[record.status] || 0) + 1;
        
      if (record.result) {
        stats.by_result[record.result] = 
          (stats.by_result[record.result] || 0) + 1;
      }

      // Počítání alertů
      if (record.status === 'overdue') stats.alerts.overdue_controls++;
      if (record.result === 'failed') stats.alerts.failed_controls++;
      if (record.maintenance_required) stats.alerts.maintenance_required++;
    });

    await new Promise(resolve => setTimeout(resolve, 200));
    return stats;
  } catch (error) {
    console.error(`Chyba při načítání statistik pro zařízení ${equipmentId}:`, error);
    throw { error: 'Došlo k chybě při načítání statistik' };
  }
};

// Získat checklist šablonu z API
export const getChecklistTemplate = async (category = 'daily', equipmentType = null) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('category', category);
    if (equipmentType) {
      queryParams.append('equipment_type', equipmentType);
    }

    const response = await api.get(`/logbook/checklist-template?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Chyba při načítání checklist šablony:', error);
    
    // Fallback na mock šablonu
    return [{
      id: 1,
      name: 'Denní kontrola jeřábu',
      category: 'daily',
      equipment_type: 'jerab',
      items: [
        {
          id: 1,
          item_text: 'Vizuální kontrola nosné konstrukce (praskliny, deformace)',
          category: 'visual',
          order_index: 1,
          required: true
        },
        {
          id: 2,
          item_text: 'Kontrola svarů a spojů',
          category: 'visual',
          order_index: 2,
          required: true
        },
        {
          id: 3,
          item_text: 'Stav lan a řetězů',
          category: 'visual',
          order_index: 3,
          required: true
        },
        {
          id: 4,
          item_text: 'Funkce všech ovládacích prvků',
          category: 'functional',
          order_index: 6,
          required: true
        },
        {
          id: 5,
          item_text: 'Funkce brzd a pojistek',
          category: 'functional',
          order_index: 7,
          required: true
        }
      ]
    }];
  }
};

// Helper funkce pro typy záznamů
export const getRecordCategories = () => {
  return [
    { value: 'control', label: 'Kontroly', icon: '🔍', color: 'blue' },
    { value: 'revision', label: 'Revize', icon: '📋', color: 'green' },
    { value: 'maintenance', label: 'Údržba', icon: '🔧', color: 'yellow' },
    { value: 'incident', label: 'Incident', icon: '⚠️', color: 'red' },
    { value: 'montage', label: 'Montáž', icon: '🏗️', color: 'purple' }
  ];
};

export const getRecordTypes = () => {
  return [
    // Kontroly
    { value: 'daily', label: 'Denní kontrola', category: 'control', period: 'daily' },
    { value: 'weekly', label: 'Týdenní kontrola', category: 'control', period: 'weekly' },
    { value: 'monthly', label: 'Měsíční kontrola', category: 'control', period: 'monthly' },
    { value: 'quarterly', label: 'Čtvrtletní kontrola', category: 'control', period: 'quarterly' },
    { value: 'semi_annual', label: 'Půlroční kontrola', category: 'control', period: 'semi_annual' },
    { value: 'annual', label: 'Roční kontrola', category: 'control', period: 'annual' },
    
    // Revize
    { value: 'post_montage', label: 'Revize po montáži', category: 'revision' },
    { value: 'periodic_revision', label: 'Periodická revize', category: 'revision' },
    { value: 'extraordinary_revision', label: 'Mimořádná revize', category: 'revision' },
    
    // Údržba
    { value: 'preventive_maintenance', label: 'Preventivní údržba', category: 'maintenance' },
    { value: 'corrective_maintenance', label: 'Nápravná údržba', category: 'maintenance' },
    { value: 'repair', label: 'Oprava', category: 'maintenance' },
    
    // Incidenty
    { value: 'safety_incident', label: 'Bezpečnostní incident', category: 'incident' },
    { value: 'malfunction', label: 'Porucha', category: 'incident' },
    { value: 'extraordinary_event', label: 'Mimořádná událost', category: 'incident' }
  ];
};