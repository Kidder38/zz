import React, { useState } from 'react';
import { changePassword } from '../../services/userService';

const PasswordChangeForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Vymaž chybu, pokud uživatel opravuje pole
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Aktuální heslo je povinné';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Nové heslo je povinné';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Heslo musí obsahovat alespoň 6 znaků';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Potvrzení hesla je povinné';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Hesla se neshodují';
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
      setSuccessMessage('');
      
      await changePassword(formData.currentPassword, formData.newPassword);
      
      setSuccessMessage('Heslo bylo úspěšně změněno');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Volání onSuccess callbacku, pokud byl předán
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setErrors({
        form: error.error || 'Došlo k chybě při změně hesla. Zkontrolujte aktuální heslo a zkuste to znovu.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      
      {errors.form && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{errors.form}</span>
        </div>
      )}
      
      <div className="space-y-4">
        {/* Aktuální heslo */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
            Aktuální heslo *
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
          {errors.currentPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
          )}
        </div>

        {/* Nové heslo */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
            Nové heslo *
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
          )}
        </div>

        {/* Potvrzení hesla */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Potvrzení nového hesla *
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Zrušit
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {loading ? 'Ukládám...' : 'Změnit heslo'}
        </button>
      </div>
    </form>
  );
};

export default PasswordChangeForm;