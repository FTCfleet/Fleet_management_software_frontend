# Frontend Changes Summary

## Overview
Implemented three critical requirements based on backend changes:
1. Session expiry handling (48-hour token expiration)
2. Freight & Hamali input display improvements (no decimals unless user enters them)
3. Null value handling for undefined rates (blank instead of 0)

---

## 1. Session Expiry Handling (48 Hours)

### Changes Made:

#### `src/routes/AuthContext.jsx`
- Added global fetch interceptor to detect session expiry across all API calls
- Excludes authentication endpoints (login, register, forgot-password, etc.) from expiry check
- Intercepts responses with status 401 or message "Session expired. Please login again"
- Automatically clears token and redirects to /auth/login page
- Shows user-friendly alert: "Your session has expired. Please login again."
- Updated `checkAuthStatus()` to handle session expiry message from backend

#### `src/utils/apiUtils.js` (NEW FILE)
- Created utility functions for API calls with session expiry detection
- `isSessionExpired()` - Checks if response indicates expired session
- `handleSessionExpiry()` - Clears token and redirects to /auth/login
- `fetchWithAuth()` - Wrapper for fetch with automatic session handling
- `checkSessionExpiry()` - Manual check for session expiry

### How It Works:
- Backend now issues JWT tokens with 48-hour expiration
- When token expires, any API call returns 401 or expiry message
- Frontend intercepts this globally and forces re-login
- Redirects to /auth/login page
- Works for all users (admin, supervisor, staff)
- Even if PC is left logged in, API calls will fail after 48 hours

---

## 2. Freight & Hamali Input Display Improvements

### Changes Made:

#### `src/utils/currencyUtils.js`
- Added `formatInputDisplay()` - Formats input to hide .00 unless user types decimal
- Added `isValidDecimalInput()` - Validates decimal input (allows "12." or "12.5")
- Updated to handle partial decimal input gracefully

#### `src/pages/AddOrderPage.jsx`
- Imported `formatInputDisplay` and `isValidDecimalInput`
- Updated `handleInputChange()` to validate freight/hamali input
- When matched item is found, uses `formatInputDisplay()` to show value without .00
- Prevents invalid decimal input in real-time

#### `src/pages/EditOrderPage.jsx`
- Same changes as AddOrderPage.jsx
- Validates input for new items being added
- Displays existing items without unnecessary decimals

#### `src/pages/AllItemPage.jsx`
- Updated `handleEdit()` to use `formatInputDisplay()`
- Added input validation in `handleItemChange()`
- Shows blank for null values, integers without decimals

### How It Works:
- Empty fields show as blank (not 0 or 0.00)
- When user types "12", shows "12" (not "12.00")
- When user types "12.", keeps the decimal point
- When user types "12.5", shows "12.5"
- Only shows .00 if user explicitly enters it
- Prevents confusion during data entry

---

## 3. Null Value Handling for Undefined Rates

### Changes Made:

#### `src/utils/currencyUtils.js`
- Updated `fromDbValue()` - Returns "-" (single hyphen) for null/undefined/zero values when `showDashForNull=true`
- Added `fromDbValueNum()` - Returns 0 for calculations when value is null
- Updated `toDbValue()` - Returns null for empty/blank inputs (not 0)
- Updated `formatCurrency()` - Returns "-" for null/zero values when `showDashForNull=true`
- Hyphen provides space for manual pen entry on printed documents

#### `src/pages/AddOrderPage.jsx`
- Updated item matching to check for null: `matchedItem.freight !== null`
- Shows "-" when predefined rate is null or zero
- Sends null to backend for empty fields: `item.freight === '' ? null : parseFloat(item.freight)`
- Updated calculations to handle null: `(toDbValue(item.freight) || 0)`
- Amount column shows "-" for zero totals
- Charges summary shows "-" for zero freight/hamali/total

#### `src/pages/EditOrderPage.jsx`
- Same null handling as AddOrderPage.jsx
- Existing items with null values display as "-"
- New items can have null freight/hamali
- Calculations safely handle null values
- All totals show "-" when zero

#### `src/pages/AllItemPage.jsx`
- Updated `handleEdit()` to preserve null values as empty strings
- Sends null to backend for empty fields
- Displays null values as "-" in item list

#### `src/pages/ViewOrderPage.jsx`
- Uses `formatCurrency()` with `showDashForNull=true` parameter
- Displays "-" for null freight/hamali values
- Item table shows "-" for zero amounts
- Total row shows "-" when zero
- Perfect for printing - hyphen can be filled with pen

#### `src/pages/AllOrderPage.jsx`
- Updated order card and table to show "-" for zero totals
- Handles null freight/hamali in calculations
- Shows hyphen instead of ₹0.00

### How It Works:
- Backend stores null for undefined rates (not 0)
- Frontend receives null and displays as "-" (single hyphen)
- User sees hyphen instead of ₹0.00
- When user doesn't enter value, frontend sends null to backend
- Backend stores null in database
- Calculations treat null as 0 to avoid errors
- Zero totals also display as "-" for manual entry
- Printed documents have space to fill in values with pen
- Clean, minimal display with single character

---

## Files Modified

1. **src/routes/AuthContext.jsx** - Session expiry handling
2. **src/utils/apiUtils.js** - NEW FILE - API utilities
3. **src/utils/currencyUtils.js** - Null handling, input formatting, and dash display
4. **src/pages/AddOrderPage.jsx** - Input validation, null handling, and dash display
5. **src/pages/EditOrderPage.jsx** - Input validation, null handling, and dash display
6. **src/pages/AllItemPage.jsx** - Input validation, null handling, and dash display
7. **src/pages/ViewOrderPage.jsx** - Dash display for null/zero values
8. **src/pages/AllOrderPage.jsx** - Dash display for zero totals

---

## Testing Recommendations

### Session Expiry:
1. Login and wait 48 hours (or modify backend to 1 minute for testing)
2. Try to make any API call
3. Should see alert and redirect to /auth/login
4. Verify token is cleared from localStorage

### Input Display:
1. Create new LR
2. Add item with predefined rate
3. Verify freight/hamali show without .00 (e.g., "50" not "50.00")
4. Type "12" in freight field - should show "12"
5. Type "12." - should keep decimal point
6. Type "12.5" - should show "12.5"

### Null Values:
1. Create item with blank freight/hamali
2. Verify it saves as null in database
3. Edit the item - should show blank fields (not 0.00)
4. Use item in LR - should show "-" (not ₹0.00)
5. Verify calculations work correctly with null values
6. Print LR - verify hyphen appears for manual pen entry
7. Create LR with zero total - should show "-" not ₹0.00

---

## Backend Compatibility

All changes are compatible with backend modifications:
- Backend sends null for undefined rates ✓
- Backend accepts null from frontend ✓
- Backend multiplies by 100 for storage ✓
- Backend returns "Session expired" message ✓
- JWT tokens expire after 48 hours ✓

---

## User Experience Improvements

1. **Clearer Input**: No confusing decimals when entering whole numbers
2. **Better Visibility**: Single hyphen "-" clearly indicates "no rate defined" or "fill with pen"
3. **Automatic Security**: Users forced to re-login after 48 hours
4. **Consistent Behavior**: All pages handle null values uniformly with hyphen display
5. **Error Prevention**: Input validation prevents invalid decimal entry
6. **Print-Friendly**: Hyphen provides space for manual entry on printed documents
7. **Professional Look**: Zero values show as hyphen instead of ₹0.00
8. **Clean Display**: Minimal, uncluttered appearance with single character
