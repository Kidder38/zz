// Service pro správu lokací/staveb
import api from './api';

// Počáteční mock data - udržujeme je v modulu jako stav
let mockLocations = [
      {
        id: 1,
        location_name: 'Hlavní sklad',
        location_type: 'warehouse',
        city: 'Praha',
        address: 'Průmyslová 123, Praha 10',
        contact_person: 'Jan Skladník',
        contact_phone: '+420 601 234 567',
        contact_email: 'sklad@jerabyspol.cz',
        is_active: true,
        active_from: '2023-01-01',
        created_at: '2023-01-01T10:00:00'
      },
      {
        id: 2,
        location_name: 'Stavba - Wenceslas Square',
        location_type: 'construction_site',
        city: 'Praha',
        address: 'Václavské náměstí, Praha 1',
        contact_person: 'Petr Stavitel',
        contact_phone: '+420 602 345 678',
        contact_email: 'stavba1@jerabyspol.cz',
        is_active: true,
        active_from: '2024-01-15',
        planned_completion: '2024-06-30',
        created_at: '2024-01-10T08:00:00'
      },
      {
        id: 3,
        location_name: 'Stavba - Brno Central',
        location_type: 'construction_site',
        city: 'Brno',
        address: 'Moravské náměstí, Brno',
        contact_person: 'Marie Projektová',
        contact_phone: '+420 603 456 789',
        contact_email: 'brno@jerabyspol.cz',
        is_active: true,
        active_from: '2024-03-01',
        created_at: '2024-02-15T09:00:00'
      },
      {
        id: 4,
        location_name: 'Servisní dílna',
        location_type: 'workshop',
        city: 'Praha',
        address: 'Řemeslnická 45, Praha 5',
        contact_person: 'Tomáš Mechanik',
        contact_phone: '+420 604 567 890',
        contact_email: 'servis@jerabyspol.cz',
        is_active: true,
        active_from: '2022-01-01',
        created_at: '2022-01-01T10:00:00'
      }
];

// Získat všechny lokace
export const getLocations = async (params = {}) => {
  try {
    // Simulace API zpoždění
    await new Promise(resolve => setTimeout(resolve, 200));

    // Aplikovat filtry pokud existují
    let filtered = mockLocations;
    if (params.type) {
      filtered = filtered.filter(loc => loc.location_type === params.type);
    }
    if (params.active !== undefined) {
      filtered = filtered.filter(loc => loc.is_active === params.active);
    }
    if (params.city) {
      filtered = filtered.filter(loc => 
        loc.city.toLowerCase().includes(params.city.toLowerCase())
      );
    }

    return filtered;
  } catch (error) {
    console.error('Chyba při načítání lokací:', error);
    throw { error: 'Došlo k chybě při načítání lokací' };
  }
};

// Získat detaily konkrétní lokace
export const getLocation = async (id) => {
  try {
    const locations = await getLocations();
    const location = locations.find(l => l.id === parseInt(id));
    
    if (!location) {
      throw { error: 'Lokace nenalezena' };
    }

    // Simulace API zpoždění
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return location;
  } catch (error) {
    console.error(`Chyba při načítání lokace ${id}:`, error);
    throw { error: 'Došlo k chybě při načítání lokace' };
  }
};

// Vytvořit novou lokaci
export const createLocation = async (locationData) => {
  try {
    // V produkci by se poslalo na API
    // const response = await api.post('/locations', locationData);
    // return response.data;
    
    // Pro development skutečně přidáme lokaci do mock dat
    const newLocation = {
      id: Date.now(), // Dočasné ID
      ...locationData,
      is_active: true,
      created_at: new Date().toISOString()
    };

    // Přidáme do pole
    mockLocations.push(newLocation);

    await new Promise(resolve => setTimeout(resolve, 300));
    return newLocation;
  } catch (error) {
    console.error('Chyba při vytváření lokace:', error);
    throw error.response?.data || { error: 'Došlo k chybě při vytváření lokace' };
  }
};

// Aktualizovat existující lokaci
export const updateLocation = async (id, locationData) => {
  try {
    // V produkci by se poslalo na API
    // const response = await api.put(`/locations/${id}`, locationData);
    // return response.data;

    // Pro development skutečně aktualizujeme lokaci v mock datech
    const locationIndex = mockLocations.findIndex(loc => loc.id === parseInt(id));
    
    if (locationIndex === -1) {
      throw { error: 'Lokace nenalezena' };
    }
    
    // Aktualizujeme lokaci
    const updatedLocation = {
      ...mockLocations[locationIndex],
      ...locationData,
      id: parseInt(id), // Zachováme původní ID
      updated_at: new Date().toISOString()
    };
    
    mockLocations[locationIndex] = updatedLocation;

    await new Promise(resolve => setTimeout(resolve, 250));
    return updatedLocation;
  } catch (error) {
    console.error(`Chyba při aktualizaci lokace ${id}:`, error);
    throw error.response?.data || { error: 'Došlo k chybě při aktualizaci lokace' };
  }
};

// Smazat lokaci
export const deleteLocation = async (id) => {
  try {
    // V produkci by se poslalo na API
    // const response = await api.delete(`/locations/${id}`);
    // return response.data;

    // Pro development skutečně odstraníme lokaci z mock dat
    const locationIndex = mockLocations.findIndex(loc => loc.id === parseInt(id));
    
    if (locationIndex === -1) {
      throw { error: 'Lokace nenalezena' };
    }
    
    // Odstraníme lokaci z pole
    mockLocations.splice(locationIndex, 1);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    return { message: 'Lokace byla úspěšně smazána' };
  } catch (error) {
    console.error(`Chyba při mazání lokace ${id}:`, error);
    throw error.response?.data || { error: 'Došlo k chybě při mazání lokace' };
  }
};

// Získat jeřáby na konkrétní lokaci
export const getEquipmentAtLocation = async (locationId) => {
  try {
    // V produkci by se poslalo na API
    // const response = await api.get(`/locations/${locationId}/equipment`);
    // return response.data;

    // Pro development mock data
    const mockEquipmentLocations = {
      2: [ // Stavba - Wenceslas Square
        { id: 1, equipment_type: 'Věžový jeřáb', model: 'Liebherr 130 EC-B', status: 'operational' },
        { id: 3, equipment_type: 'Mobilní jeřáb', model: 'Demag AC 40', status: 'operational' }
      ],
      3: [ // Stavba - Brno Central  
        { id: 2, equipment_type: 'Věžový jeřáb', model: 'Potain MCT 85', status: 'operational' }
      ],
      1: [ // Hlavní sklad
        { id: 4, equipment_type: 'Mobilní jeřáb', model: 'Liebherr LTM 1030', status: 'stored' }
      ]
    };

    await new Promise(resolve => setTimeout(resolve, 150));
    return mockEquipmentLocations[parseInt(locationId)] || [];
  } catch (error) {
    console.error(`Chyba při načítání zařízení na lokaci ${locationId}:`, error);
    throw { error: 'Došlo k chybě při načítání zařízení na lokaci' };
  }
};

// Získat typy lokací pro formuláře
export const getLocationTypes = () => {
  return [
    { value: 'construction_site', label: 'Stavba', icon: '🏗️' },
    { value: 'warehouse', label: 'Sklad', icon: '📦' },
    { value: 'workshop', label: 'Dílna', icon: '🔧' },
    { value: 'transport', label: 'Přeprava', icon: '🚛' }
  ];
};