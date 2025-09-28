import React, { useState, useEffect } from 'react';
import { createLocation, updateLocation, getLocationTypes } from '../../services/locationService';

const LocationForm = ({ initialValues, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    location_name: '',
    location_type: 'construction_site',
    address: '',
    city: '',
    country: 'CZ',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    active_from: new Date().toISOString().split('T')[0],
    active_to: '',
    is_active: true
  });

  const locationTypes = getLocationTypes();

  // Naplnění formuláře při editaci
  useEffect(() => {
    if (initialValues) {
      setFormData({
        location_name: initialValues.location_name || '',
        location_type: initialValues.location_type || 'construction_site',
        address: initialValues.address || '',
        city: initialValues.city || '',
        country: initialValues.country || 'CZ',
        contact_person: initialValues.contact_person || '',
        contact_phone: initialValues.contact_phone || '',
        contact_email: initialValues.contact_email || '',
        active_from: initialValues.active_from || new Date().toISOString().split('T')[0],
        active_to: initialValues.active_to || '',
        is_active: initialValues.is_active !== undefined ? initialValues.is_active : true
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Vymaž chybu pro pole
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.location_name.trim()) {
      newErrors.location_name = 'Název lokace je povinný';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'Město je povinné';
    }
    
    if (!formData.active_from) {
      newErrors.active_from = 'Datum aktivace je povinné';
    }
    
    if (formData.active_to && formData.active_from && 
        new Date(formData.active_to) <= new Date(formData.active_from)) {
      newErrors.active_to = 'Konec platnosti musí být po začátku';
    }
    
    if (formData.contact_email && !/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = 'Neplatný formát emailu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const locationData = {
        ...formData,
        active_to: formData.active_to || null // Prázdné datum jako null
      };

      if (initialValues) {
        await updateLocation(initialValues.id, locationData);
      } else {
        await createLocation(locationData);
      }

      await onSubmit();
    } catch (error) {
      console.error('Chyba při ukládání lokace:', error);
      setErrors({ general: 'Došlo k chybě při ukládání lokace' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {errors.general}
        </div>
      )}

      {/* Základní informace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="location_name" className="block text-sm font-medium text-gray-700">
            Název lokace *
          </label>
          <input
            type="text"
            id="location_name"
            name="location_name"
            value={formData.location_name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Např. Stavba - Wenceslas Square"
            required
          />
          {errors.location_name && (
            <p className="mt-1 text-sm text-red-600">{errors.location_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="location_type" className="block text-sm font-medium text-gray-700">
            Typ lokace *
          </label>
          <select
            id="location_type"
            name="location_type"
            value={formData.location_type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            {locationTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Adresa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Adresa
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Václavské náměstí 1"
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            Město *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Praha"
            required
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700">
          Země
        </label>
        <select
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="CZ">Česká republika</option>
          <option value="SK">Slovensko</option>
          <option value="AT">Rakousko</option>
          <option value="DE">Německo</option>
          <option value="PL">Polsko</option>
        </select>
      </div>

      {/* Kontaktní informace */}
      <div className="border-t pt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Kontaktní informace</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700">
              Kontaktní osoba
            </label>
            <input
              type="text"
              id="contact_person"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Ing. Jan Novák"
            />
          </div>

          <div>
            <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
              Telefon
            </label>
            <input
              type="tel"
              id="contact_phone"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="+420 123 456 789"
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="contact_email"
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="jan.novak@example.com"
          />
          {errors.contact_email && (
            <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>
          )}
        </div>
      </div>

      {/* Časové období */}
      <div className="border-t pt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Aktivní období</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="active_from" className="block text-sm font-medium text-gray-700">
              Aktivní od *
            </label>
            <input
              type="date"
              id="active_from"
              name="active_from"
              value={formData.active_from}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
            {errors.active_from && (
              <p className="mt-1 text-sm text-red-600">{errors.active_from}</p>
            )}
          </div>

          <div>
            <label htmlFor="active_to" className="block text-sm font-medium text-gray-700">
              Aktivní do
            </label>
            <input
              type="date"
              id="active_to"
              name="active_to"
              value={formData.active_to}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.active_to && (
              <p className="mt-1 text-sm text-red-600">{errors.active_to}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Ponechte prázdné pro neurčité období
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="border-t pt-6">
        <div className="flex items-center">
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-gray-700">
            Lokace je aktivní
          </label>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Neaktivní lokace se nezobrazují v seznamech pro nové záznamy
        </p>
      </div>

      {/* Tlačítka */}
      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Zrušit
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Ukládám...' : (initialValues ? 'Uložit změny' : 'Vytvořit lokaci')}
        </button>
      </div>
    </form>
  );
};

export default LocationForm;