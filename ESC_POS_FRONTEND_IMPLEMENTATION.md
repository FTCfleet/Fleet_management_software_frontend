# ESC/POS Frontend Implementation Summary

## ✅ Implementation Complete!

The thermal LR printing now generates **ESC/POS commands directly in the frontend** instead of using HTML. This is faster, more reliable, and gives precise control over the thermal printer.

---

## What Changed

### Frontend Changes:

#### 1. **New File: `src/utils/escPosGenerator.js`**
- Generates raw ESC/POS commands for thermal printer
- Converts parcel data to printer-ready format
- Handles 3 copies (2 normal + 1 auto for "To Pay")
- Includes auto-cut command after each copy

**Key Functions:**
- `generateESCPOSReceipt(parcel, auto)` - Generate single receipt
- `generateThreeCopies(parcel)` - Generate all 3 copies as one string
- `generateCopiesArray(parcel)` - Generate 3 copies as array (for QZ Tray)

#### 2. **Updated: `src/utils/qzTrayUtils.js`**
- Changed to fetch raw parcel data instead of HTML
- Uses ESC/POS generator to create printer commands
- Sends raw commands directly to printer via QZ Tray

**New Flow:**
```javascript
Fetch parcel data → Generate ESC/POS commands → Send to QZ Tray → Print
```

**Old Flow (removed):**
```javascript
Fetch HTML receipts → Wrap in HTML → Send to QZ Tray → Print
```

---

## Backend Changes Required

### ❌ **REMOVE** (No longer needed):
- `/api/parcel/generate-lr-qz-tray/:trackingId` endpoint
- `generateLRForQZTray()` function in `parcelController.js`
- `generateLRForQZTray()` function in `utils/LRThermal.js`
- Route in `parcelRoutes.js`

### ✅ **USE** (Already exists):
- `/api/parcel/:trackingId` endpoint
- Returns raw parcel data with all populated fields

**Required Response Format:**
```json
{
  "flag": true,
  "data": {
    "trackingId": "HYD02-12345",
    "placedAt": "2026-01-28T10:30:00.000Z",
    "payment": "To Pay",
    "freight": 100000,  // In paise
    "hamali": 5000,     // In paise
    "isDoorDelivery": true,
    "doorDeliveryCharge": 10000,  // In paise
    "sourceWarehouse": {
      "warehouseID": "HYD-01",
      "name": "Hyderabad",
      "phoneNo": "1234567890"
    },
    "destinationWarehouse": {
      "warehouseID": "MNCL",
      "name": "Mancherial",
      "phoneNo": "0987654321"
    },
    "sender": {
      "name": "John Doe",
      "phoneNo": "1234567890"
    },
    "receiver": {
      "name": "Jane Smith",
      "phoneNo": "0987654321"
    },
    "items": [
      {
        "name": "Box",
        "quantity": 5,
        "freight": 20000,  // In paise per item
        "hamali": 1000,    // In paise per item
        "itemType": {
          "name": "Carton"
        }
      }
    ],
    "addedBy": {
      "name": "Admin User"
    }
  }
}
```

**Important:** All monetary values must be in **paise** (multiply rupees by 100). The frontend will convert them using `fromDbValue()`.

---

## Benefits of ESC/POS Approach

### ✅ **Faster**
- No HTML rendering
- Direct printer commands
- Smaller data transfer

### ✅ **More Reliable**
- Native thermal printer format
- Better compatibility
- Precise formatting control

### ✅ **Simpler Backend**
- Just return raw data
- No HTML generation needed
- No CSS styling required

### ✅ **Better Formatting**
- Exact character positioning
- Proper alignment
- Bold, font sizes work perfectly

### ✅ **Auto-Cut Built-In**
- Cut command included in ESC/POS
- No separate cut command needed
- Works reliably on TVS RP 3230 ABW

---

## How It Works

### 1. User Clicks "Download Thermal"
```javascript
handleLRPrintThermal() in ViewOrderPage.jsx
```

### 2. Fetch Parcel Data
```javascript
GET /api/parcel/track/:trackingId
// Returns raw parcel data in 'body' field
```

### 3. Generate ESC/POS Commands (Frontend)
```javascript
import { generateCopiesArray } from './escPosGenerator.js';
const escPosReceipts = generateCopiesArray(parcelData);
// Returns array of 3 ESC/POS command strings
```

### 4. Send to QZ Tray
```javascript
const printData = escPosReceipts.map(commands => ({
  type: 'raw',
  format: 'plain',
  data: commands  // Raw ESC/POS commands
}));
await qz.print(config, printData);
```

### 5. Printer Executes Commands
- Prints Copy 1 → Auto-cut
- Prints Copy 2 → Auto-cut
- Prints Copy 3 (auto format for "To Pay") → Auto-cut

---

## ESC/POS Commands Used

### Text Formatting:
- `ESC @` - Initialize printer
- `ESC ! 0x00` - Normal font
- `ESC ! 0x10` - Bold
- `ESC ! 0x30` - Double height + bold

### Alignment:
- `ESC a 0x00` - Left align
- `ESC a 0x01` - Center align

### Paper Control:
- `\n` - Line feed
- `\n\n\n` - Feed 3 lines before cut
- `GS V A 0` - Partial cut (auto-cut)

---

## Testing

### Test Print:
1. Open browser console (F12)
2. Run: `runDiagnostics()`
3. Verify printer is found
4. Click "Download Thermal" button
5. Check 3 copies print with auto-cut

### Expected Output:
```
✅ QZ Tray: Working
✅ Printers Found: 1
✅ TVS Printers: 1
🎉 Setup looks good!
```

---

## Backend Cleanup Checklist

### Files to Modify:

#### 1. `controllers/parcelController.js`
**Remove:**
```javascript
// Remove generateLRForQZTray function
exports.generateLRForQZTray = async (req, res) => { ... };
```

#### 2. `routes/parcelRoutes.js`
**Remove:**
```javascript
// Remove QZ Tray route
router.get("/generate-lr-qz-tray/:id", generateLRForQZTray);
```

#### 3. `utils/LRThermal.js`
**Remove:**
```javascript
// Remove generateLRForQZTray function
const generateLRForQZTray = (parcel) => { ... };
module.exports = { ..., generateLRForQZTray };
```

### Verify Existing Endpoint:

**Keep:** `GET /api/parcel/:trackingId`

**Ensure it returns:**
- ✅ Fully populated parcel data
- ✅ All nested objects (warehouses, sender, receiver, items, addedBy)
- ✅ Monetary values in paise
- ✅ All required fields

---

## Migration Notes

### No Breaking Changes:
- Old thermal print endpoint can be removed safely
- Regular PDF LR printing still works
- Only affects thermal printing with QZ Tray

### Deployment:
1. Deploy frontend changes first
2. Clean up backend after (optional)
3. Old endpoint can stay for backward compatibility

---

## Summary

**Before:**
- Backend generates HTML receipts
- Frontend wraps in HTML/CSS
- QZ Tray renders HTML → Prints
- Separate endpoint needed

**After:**
- Backend returns raw parcel data
- Frontend generates ESC/POS commands
- QZ Tray sends raw commands → Prints
- Uses existing endpoint

**Result:**
✅ Faster printing  
✅ Better formatting  
✅ More reliable  
✅ Simpler backend  
✅ Auto-cut works perfectly  

---

## Questions?

**Q: Do I need to update QZ Tray?**
A: No, same QZ Tray version works.

**Q: Will old thermal prints still work?**
A: Yes, if you keep the old endpoint. But new approach is better.

**Q: Can I customize the receipt format?**
A: Yes! Edit `src/utils/escPosGenerator.js` to change layout, fonts, etc.

**Q: Does this work on all thermal printers?**
A: Works on ESC/POS compatible printers (most thermal printers including TVS RP 3230 ABW).

**Q: What if I want to add a logo?**
A: ESC/POS supports bitmap images. Can be added with additional commands.
