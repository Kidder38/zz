/**
 * Format a date string or Date object to a localized format
 * @param {string|Date} dateString - The date to format
 * @param {boolean} includeTime - Whether to include the time in the formatted string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '';
  }
  
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return date.toLocaleDateString('cs-CZ', options);
};