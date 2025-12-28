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
 * @returns {string} - Formatted decimal string (e.g., "125.50")
 */
export const fromDbValue = (dbValue) => {
  const num = Number(dbValue) || 0;
  return (num / 100).toFixed(2);
};

/**
 * Convert display decimal value to database integer value
 * @param {string|number} displayValue - Decimal value from user input (e.g., "125.50" or 125.5)
 * @returns {number} - Integer value for database (e.g., 12550)
 */
export const toDbValue = (displayValue) => {
  const num = parseFloat(displayValue) || 0;
  // Round to avoid floating point errors, then multiply by 100
  return Math.round(num * 100);
};

/**
 * Format a database value for display with currency symbol
 * @param {number} dbValue - Integer value from database
 * @param {string} symbol - Currency symbol (default: "₹")
 * @returns {string} - Formatted currency string (e.g., "₹125.50")
 */
export const formatCurrency = (dbValue, symbol = "₹") => {
  return `${symbol}${fromDbValue(dbValue)}`;
};

/**
 * Parse user input and return display value (always 2 decimal places)
 * @param {string} input - User input string
 * @returns {string} - Cleaned decimal string
 */
export const parseDecimalInput = (input) => {
  // Remove non-numeric characters except decimal point
  const cleaned = String(input).replace(/[^\d.]/g, '');
  // Handle multiple decimal points - keep only first
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  return cleaned;
};

/**
 * Validate and format decimal input for display
 * @param {string} input - User input
 * @returns {string} - Formatted value or empty string
 */
export const formatDecimalInput = (input) => {
  const parsed = parseDecimalInput(input);
  if (parsed === '' || parsed === '.') return '';
  const num = parseFloat(parsed);
  if (isNaN(num)) return '';
  return parsed;
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
