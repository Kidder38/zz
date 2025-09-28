import React, { useState, useEffect } from 'react';
import { ROLES, ROLE_DESCRIPTIONS } from '../../auth/roles';
import { getEquipment } from '../../services/equipmentService';

const UserForm = ({ user, onSubmit, onCancel, isEditMode }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'technician',
    is_active: true,
    // Pole specifická pro operátory
    is_operator: false,
    operator_card_number: '',
    certification_valid_until: '',
    equipment_ids: []
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [availableEquipment, setAvailableEquipment] = useState([]);

  // Naplnění formuláře při editaci existujícího uživatele
  useEffect(() => {
    if (user && isEditMode) {
      setFormData({
        username: user.username || '',
        password: '', // Heslo neposíláme zpět z API
        confirmPassword: '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'technician',
        is_active: user.is_active !== undefined ? user.is_active : true,
        // Pole specifická pro operátory
        is_operator: user.is_operator || false,
        operator_card_number: user.operator_card_number || '',
        certification_valid_until: user.certification_valid_until || '',
        equipment_ids: user.equipment_ids || []
      });
    }
  }, [user, isEditMode]);

  // Načtení dostupných zařízení
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const equipment = await getEquipment();
        setAvailableEquipment(equipment);
      } catch (error) {
        console.error('Chyba při načítání zařízení:', error);
      }
    };
    
    fetchEquipment();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Vymaž chybu, pokud uživatel opravuje pole
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
    }
  };

  const handleEquipmentChange = (equipmentId) => {
    setFormData(prevData => {
      const currentIds = prevData.equipment_ids;
      const newIds = currentIds.includes(equipmentId)
        ? currentIds.filter(id => id !== equipmentId)
        : [...currentIds, equipmentId];
      
      return {
        ...prevData,
        equipment_ids: newIds
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Uživatelské jméno je povinné';
    }
    
    if (!isEditMode && !formData.password) {
      newErrors.password = 'Heslo je povinné';
    }
    
    if (!isEditMode && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Hesla se neshodují';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Jméno je povinné';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Neplatný formát e-mailu';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Připravit data pro odeslání (bez confirmPassword)
      const { confirmPassword, ...submitData } = formData;
      
      // V případě editace neposílej heslo, pokud je prázdné
      if (isEditMode && !submitData.password) {
        delete submitData.password;
      }
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Uživatelské jméno */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Uživatelské jméno *
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={loading || (isEditMode && user.username === 'admin')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
          )}
        </div>

        {/* Křestní jméno */}
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
            Křestní jméno *
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
          )}
        </div>

        {/* Příjmení */}
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
            Příjmení *
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-mail
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Telefon */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Telefon
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="+420 123 456 789"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role *
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={loading || (isEditMode && user.username === 'admin')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            {Object.entries(ROLES).map(([key, value]) => (
              <option key={value} value={value}>
                {ROLE_DESCRIPTIONS[value]}
              </option>
            ))}
          </select>
        </div>

        {/* Heslo */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            {isEditMode ? 'Nové heslo' : 'Heslo *'}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required={!isEditMode}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
          {isEditMode && (
            <p className="mt-1 text-xs text-gray-500">Nechte prázdné, pokud nechcete změnit heslo</p>
          )}
        </div>

        {/* Potvrzení hesla */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            {isEditMode ? 'Potvrzení nového hesla' : 'Potvrzení hesla *'}
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required={!isEditMode && !!formData.password}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Aktivní účet */}
        {isEditMode && user.username !== 'admin' && (
          <div className="col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Aktivní účet
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Neaktivní uživatelé se nemohou přihlásit
            </p>
          </div>
        )}
      </div>

      {/* Operátorská sekce */}
      <div className="border-t pt-6 mt-6">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="is_operator"
            name="is_operator"
            checked={formData.is_operator}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="is_operator" className="ml-2 block text-sm font-medium text-gray-700">
            Tento uživatel je obsluha zařízení
          </label>
        </div>

        {formData.is_operator && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pl-6 border-l-2 border-blue-200 bg-blue-50 p-4 rounded-md">
            {/* Číslo průkazu obsluhy */}
            <div>
              <label htmlFor="operator_card_number" className="block text-sm font-medium text-gray-700">
                Číslo průkazu obsluhy
              </label>
              <input
                type="text"
                id="operator_card_number"
                name="operator_card_number"
                value={formData.operator_card_number}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Např. OP-2024-001"
              />
              {errors.operator_card_number && (
                <p className="mt-1 text-sm text-red-600">{errors.operator_card_number}</p>
              )}
            </div>

            {/* Platnost certifikátu */}
            <div>
              <label htmlFor="certification_valid_until" className="block text-sm font-medium text-gray-700">
                Platnost certifikátu do
              </label>
              <input
                type="date"
                id="certification_valid_until"
                name="certification_valid_until"
                value={formData.certification_valid_until}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.certification_valid_until && (
                <p className="mt-1 text-sm text-red-600">{errors.certification_valid_until}</p>
              )}
            </div>

            {/* Přiřazená zařízení */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Přiřazená zařízení
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                {availableEquipment.length === 0 ? (
                  <p className="text-sm text-gray-500">Žádná zařízení nejsou k dispozici</p>
                ) : (
                  availableEquipment.map((equipment) => (
                    <div key={equipment.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`equipment-${equipment.id}`}
                        checked={formData.equipment_ids.includes(equipment.id)}
                        onChange={() => handleEquipmentChange(equipment.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`equipment-${equipment.id}`} className="ml-3 text-sm text-gray-700">
                        <span className="font-medium">
                          {equipment.manufacturer} {equipment.model}
                        </span>
                        <span className="text-gray-500 ml-2">
                          ({equipment.equipment_type} - {equipment.company_name})
                        </span>
                      </label>
                    </div>
                  ))
                )}
              </div>
              {formData.equipment_ids.length > 0 && (
                <p className="mt-2 text-sm text-blue-600">
                  Vybráno: {formData.equipment_ids.length} zařízení
                </p>
              )}
            </div>
          </div>
        )}
      </div>

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
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {loading ? 'Ukládám...' : (isEditMode ? 'Uložit změny' : 'Vytvořit uživatele')}
        </button>
      </div>
    </form>
  );
};

export default UserForm;