import React from 'react';
import { useField } from 'formik';

const DateInput = ({ label, className, ...props }) => {
  const [field, meta, helpers] = useField(props.name);
  
  // Convert yyyy-mm-dd to dd.mm.yyyy for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  };
  
  // Convert dd.mm.yyyy to yyyy-mm-dd for form value
  const formatDateForValue = (displayString) => {
    if (!displayString || displayString.length < 10) return '';
    const parts = displayString.split('.');
    if (parts.length !== 3) return '';
    const [day, month, year] = parts;
    
    // Validate day, month, year
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    
    if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900 || yearNum > 2100) {
      return '';
    }
    
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };
  
  const handleChange = (e) => {
    let value = e.target.value;
    
    // Remove all non-numeric characters except dots
    value = value.replace(/[^\d.]/g, '');
    
    // Auto-format while typing
    if (value.length === 2 && !value.includes('.')) {
      value = value + '.';
    } else if (value.length === 5 && value.split('.').length === 2) {
      value = value + '.';
    }
    
    // Limit length
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    
    // Update display
    e.target.value = value;
    
    // Convert to yyyy-mm-dd format and update form
    if (value.length === 10) {
      const formattedDate = formatDateForValue(value);
      if (formattedDate) {
        helpers.setValue(formattedDate);
      }
    } else if (value === '') {
      helpers.setValue('');
    }
  };
  
  const handleBlur = (e) => {
    const value = e.target.value;
    if (value.length === 10) {
      const formattedDate = formatDateForValue(value);
      if (formattedDate) {
        helpers.setValue(formattedDate);
      } else {
        // Invalid date, clear the field
        e.target.value = '';
        helpers.setValue('');
      }
    }
    helpers.setTouched(true);
  };
  
  return (
    <div>
      {label && (
        <label htmlFor={props.name} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type="text"
        placeholder="dd.mm.yyyy"
        defaultValue={formatDateForDisplay(field.value)}
        onChange={handleChange}
        onBlur={handleBlur}
        className={className || "mt-1 block w-full rounded-md text-sm border-gray-300"}
        {...props}
      />
      {meta.touched && meta.error && (
        <div className="mt-1 text-xs text-red-600">{meta.error}</div>
      )}
    </div>
  );
};

export default DateInput;