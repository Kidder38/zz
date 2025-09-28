import React, { useState, useEffect } from 'react';
import { getEquipmentLocationHistory } from '../../services/equipmentLocationService';
import { getLocations } from '../../services/locationService';

const LocationManagementForm = ({ equipmentId, currentLocation, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    location_id: '',
    location_name: '',
    address: '',
    location_type: 'construction_site',
    contact_person: '',
    contact_phone: '',
    responsible_person_name: '',
    installed_date: new Date().toISOString().split('T')[0],
    planned_removal_date: '',
    operating_hours_start: '',
    notes: '',
    gps_latitude: '',
    gps_longitude: ''
  });
  
  const [availableLocations, setAvailableLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('existing'); // 'existing' nebo 'new'

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locations = await getLocations();
        setAvailableLocations(locations);
      } catch (error) {
        console.error('Chyba při načítání lokací:', error);
      }
    };
    
    fetchLocations();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      setFormData({
        location_id: currentLocation.location_id || '',
        location_name: currentLocation.location_name || '',
        address: currentLocation.address || '',
        location_type: currentLocation.location_type || 'construction_site',
        contact_person: currentLocation.contact_person || '',
        contact_phone: currentLocation.contact_phone || '',
        responsible_person_name: currentLocation.responsible_person_name || '',
        installed_date: currentLocation.installed_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        planned_removal_date: currentLocation.planned_removal_date?.split('T')[0] || '',
        operating_hours_start: currentLocation.operating_hours_start?.toString() || '',
        notes: currentLocation.notes || '',
        gps_latitude: currentLocation.gps_latitude?.toString() || '',
        gps_longitude: currentLocation.gps_longitude?.toString() || ''
      });
    }
  }, [currentLocation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (e) => {
    const locationId = e.target.value;
    const selectedLocation = availableLocations.find(loc => loc.id === parseInt(locationId));
    
    if (selectedLocation) {
      setFormData(prev => ({
        ...prev,
        location_id: locationId,
        location_name: selectedLocation.name,
        address: selectedLocation.address,
        location_type: selectedLocation.type,
        contact_person: selectedLocation.contact_person || '',
        contact_phone: selectedLocation.contact_phone || '',
        gps_latitude: selectedLocation.gps_latitude?.toString() || '',
        gps_longitude: selectedLocation.gps_longitude?.toString() || ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const locationData = {
        equipment_id: equipmentId,
        location_name: formData.location_name,
        address: formData.address,
        location_type: formData.location_type,
        contact_person: formData.contact_person,
        contact_phone: formData.contact_phone,
        responsible_person_name: formData.responsible_person_name,
        installed_date: formData.installed_date,
        planned_removal_date: formData.planned_removal_date || null,
        operating_hours_start: parseFloat(formData.operating_hours_start) || null,
        notes: formData.notes,
        gps_latitude: parseFloat(formData.gps_latitude) || null,
        gps_longitude: parseFloat(formData.gps_longitude) || null,
        action: currentLocation ? 'relocate' : 'assign'
      };

      await onSubmit(locationData);
    } catch (error) {
      console.error('Chyba při ukládání lokace:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode selection */}
      <div className="flex space-x-4 border-b pb-4">
        <button
          type="button"
          onClick={() => setMode('existing')}
          className={`px-4 py-2 rounded-md ${
            mode === 'existing' 
              ? 'bg-blue-100 text-blue-800 border border-blue-300' 
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          📍 Existující lokace
        </button>
        <button
          type="button"
          onClick={() => setMode('new')}
          className={`px-4 py-2 rounded-md ${
            mode === 'new' 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          ➕ Nová lokace
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Výběr existující lokace */}
        {mode === 'existing' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vybrat existující lokaci *
            </label>
            <select
              value={formData.location_id}
              onChange={handleLocationSelect}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={mode === 'existing'}
            >
              <option value="">-- Vyberte lokaci --</option>
              {availableLocations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name} ({location.address})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Informace o lokaci */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Název lokace *
            </label>
            <input
              type="text"
              name="location_name"
              value={formData.location_name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={mode === 'existing' && formData.location_id}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Typ lokace
            </label>
            <select
              name="location_type"
              value={formData.location_type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="construction_site">Staveniště</option>
              <option value="warehouse">Sklad</option>
              <option value="maintenance">Údržba</option>
              <option value="transport">Přeprava</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresa *
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={mode === 'existing' && formData.location_id}
          />
        </div>

        {/* GPS souřadnice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GPS - Zeměpisná šířka
            </label>
            <input
              type="number"
              step="any"
              name="gps_latitude"
              value={formData.gps_latitude}
              onChange={handleChange}
              placeholder="např. 50.0755"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GPS - Zeměpisná délka
            </label>
            <input
              type="number"
              step="any"
              name="gps_longitude"
              value={formData.gps_longitude}
              onChange={handleChange}
              placeholder="např. 14.4378"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Kontaktní údaje */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kontaktní osoba na stavbě
            </label>
            <input
              type="text"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon
            </label>
            <input
              type="tel"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Odpovědná osoba (naše firma)
          </label>
          <input
            type="text"
            name="responsible_person_name"
            value={formData.responsible_person_name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Časové údaje */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datum montáže *
            </label>
            <input
              type="date"
              name="installed_date"
              value={formData.installed_date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plánovaná demontáž
            </label>
            <input
              type="date"
              name="planned_removal_date"
              value={formData.planned_removal_date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motohodiny při montáži
            </label>
            <input
              type="number"
              step="0.1"
              name="operating_hours_start"
              value={formData.operating_hours_start}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Poznámky
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Další informace k lokaci nebo montáži..."
          />
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ukládání...' : (currentLocation ? 'Přesunout zařízení' : 'Přiřadit lokaci')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Zrušit
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationManagementForm;