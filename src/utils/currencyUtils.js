/**
 * Currency Utility Functions
 * 
 * The database stores monetary values as integers (multiplied by 100) to avoid floating point errors.
 * For example: ₹125.50 is stored as 12550 in the database.
 * 
 * These utilities handle the conversion between:
 * - Display values (decimal, e.g., 125.50)
 * - Database values (integer, e.g., 12550)
 */

/**
 * Convert database integer value to display decimal value
 * @param {number} dbValue - Integer value from database (e.g., 12550)
 * @param {boolean} showDashForNull - If true, shows "-" for null values (for printing)
 * @returns {string} - Formatted decimal string (e.g., "125.50") or hyphen for null/undefined
 */
export const fromDbValue = (dbValue, showDashForNull = false) => {
  // Return hyphen for null/undefined values (for manual pen entry)
  if (dbValue === null || dbValue === undefined) return showDashForNull ? '-' : '';
  const num = Number(dbValue);
  if (isNaN(num)) return showDashForNull ? '-' : '';
  // Return dash for zero values
  if (num === 0) return showDashForNull ? '-' : '';
  return (num / 100).toFixed(2);
};

/**
 * Convert database value to number for calculations (returns 0 for null)
 * @param {number} dbValue - Integer value from database
 * @returns {number} - Numeric value for calculations
 */
export const fromDbValueNum = (dbValue) => {
  if (dbValue === null || dbValue === undefined) return 0;
  const num = Number(dbValue);
  return isNaN(num) ? 0 : num / 100;
};

/**
 * Convert display decimal value to database integer value
 * @param {string|number} displayValue - Decimal value from user input (e.g., "125.50" or 125.5)
 * @returns {number|null} - Integer value for database (e.g., 12550) or null for empty/blank
 */
export const toDbValue = (displayValue) => {
  // Return null for empty/blank values (backend expects null for undefined rates)
  if (displayValue === '' || displayValue === null || displayValue === undefined) return null;
  const num = parseFloat(displayValue);
  if (isNaN(num)) return null;
  // Round to avoid floating point errors, then multiply by 100
  return Math.round(num * 100);
};

/**
 * Format a database value for display with currency symbol
 * @param {number} dbValue - Integer value from database
 * @param {string} symbol - Currency symbol (default: "₹")
 * @param {boolean} showDashForNull - If true, shows hyphen for null/zero values
 * @returns {string} - Formatted currency string (e.g., "₹125.50") or hyphen for null/zero
 */
export const formatCurrency = (dbValue, symbol = "₹", showDashForNull = false) => {
  if (dbValue === null || dbValue === undefined) {
    return showDashForNull ? '-' : '';
  }
  const num = Number(dbValue);
  if (isNaN(num) || num === 0) {
    return showDashForNull ? '-' : '';
  }
  const formatted = fromDbValue(dbValue, showDashForNull);
  return formatted && formatted !== '-' ? `${symbol}${formatted}` : (showDashForNull ? '-' : '');
};

/**
 * Format input value for display - hides .00 unless user typed decimal
 * @param {string|number} value - Current input value
 * @returns {string} - Formatted value (blank, integer, or decimal)
 */
export const formatInputDisplay = (value) => {
  // Return empty string for null/undefined/empty
  if (value === null || value === undefined || value === '') return '';
  
  const str = String(value);
  
  // If user is typing a decimal point, keep it
  if (str.endsWith('.')) return str;
  
  // If value has decimal point with digits, show as-is
  if (str.includes('.')) return str;
  
  // For whole numbers, show without decimal
  const num = parseFloat(str);
  if (isNaN(num)) return '';
  
  // Return integer without decimals
  return String(num);
};

/**
 * Validate decimal input (allows partial input like "12." or "12.5")
 * @param {string} input - User input
 * @returns {boolean} - True if valid partial or complete decimal
 */
export const isValidDecimalInput = (input) => {
  if (input === '' || input === null || input === undefined) return true;
  // Allow numbers with optional single decimal point and digits
  return /^\d*\.?\d*$/.test(String(input));
};

/**
 * Calculate total from array of items (values already in DB format)
 * @param {Array} items - Array of items with numeric properties
 * @param {string} field - Field name to sum
 * @param {string} quantityField - Optional quantity field for multiplication
 * @returns {number} - Total in DB format (integer)
 */
export const calculateTotal = (items, field, quantityField = null) => {
  return items.reduce((sum, item) => {
    const value = Number(item[field]) || 0;
    const quantity = quantityField ? (Number(item[quantityField]) || 1) : 1;
    return sum + (value * quantity);
  }, 0);
};

/**
 * Convert an object's monetary fields from DB to display format
 * @param {Object} obj - Object with monetary fields
 * @param {Array} fields - Array of field names to convert
 * @returns {Object} - New object with converted values
 */
export const convertFromDb = (obj, fields) => {
  const result = { ...obj };
  fields.forEach(field => {
    if (result[field] !== undefined) {
      result[field] = fromDbValue(result[field]);
    }
  });
  return result;
};

/**
 * Convert an object's monetary fields from display to DB format
 * @param {Object} obj - Object with monetary fields
 * @param {Array} fields - Array of field names to convert
 * @returns {Object} - New object with converted values
 */
export const convertToDb = (obj, fields) => {
  const result = { ...obj };
  fields.forEach(field => {
    if (result[field] !== undefined) {
      result[field] = toDbValue(result[field]);
    }
  });
  return result;
};
