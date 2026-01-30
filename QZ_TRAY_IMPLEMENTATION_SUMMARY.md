# QZ Tray Implementation for Thermal LR Printing with Auto-Cut

## Overview
Implemented QZ Tray integration to enable automatic paper cutting after each LR receipt on TVS RP 3230 ABW thermal printer.

---

## Frontend Changes Made

### 1. **Added QZ Tray Script** (`index.html`)
- Added QZ Tray library to the HTML head
- Script URL: `https://unpkg.com/qz-tray@2.2.4/qz-tray.js`
- Loaded globally for use across the application

### 2. **Created QZ Tray Utility Module** (`src/utils/qzTrayUtils.js`)
Reusable utility functions for thermal printing:

**Key Functions:**
- `isQZTrayAvailable()` - Check if QZ Tray is installed
- `connectQZTray()` - Connect to QZ Tray service
- `disconnectQZTray()` - Disconnect from QZ Tray
- `printThermalLRWithAutoCut()` - Main printing function with auto-cut
- `getAvailablePrinters()` - List all connected printers
- `getQZTrayErrorMessage()` - User-friendly error messages

**ESC/POS Commands:**
- `PARTIAL_CUT`: `\x1D\x56\x41\x00` (GS V A 0) - Recommended for TVS RP 3230
- `FULL_CUT`: `\x1D\x56\x00` (GS V 0) - Alternative full cut
- `FEED_AND_CUT`: Feed 3 lines then cut

**Default Configuration:**
- Printer Name: "TVS RP 3230"
- Cut Type: Partial cut (recommended)

### 3. **Updated ViewOrderPage** (`src/pages/ViewOrderPage.jsx`)
- Imported QZ Tray utilities
- Refactored `handleLRPrintThermal()` to use QZ Tray
- Removed old browser print method
- Added comprehensive error handling

---

## Backend Changes (Already Implemented)

### New API Endpoint
**GET** `/api/parcel/generate-lr-qz-tray/:trackingId`

**Response Format:**
```json
{
  "flag": true,
  "trackingId": "HYD02-12345",
  "styles": "/* CSS styles for receipt */",
  "receipts": [
    "<div class='lr-receipt'>...</div>",  // Copy 1
    "<div class='lr-receipt'>...</div>",  // Copy 2
    "<div class='lr-receipt'>...</div>"   // Copy 3 (auto)
  ]
}
```

**Key Features:**
- Returns individual receipt HTML separately
- Includes CSS styles for formatting
- Generates 3 copies (2 manual + 1 auto)
- Each receipt can have auto-cut command inserted

---

## How It Works

### Print Flow:
1. **User clicks "Download Thermal" button**
2. **Frontend checks QZ Tray availability**
   - If not installed → Show installation prompt
3. **Fetch LR data from new endpoint**
   - GET `/api/parcel/generate-lr-qz-tray/:trackingId`
4. **Connect to QZ Tray**
5. **Build print data array:**
   ```javascript
   [
     { type: 'html', data: '<html>...Receipt 1...</html>' },
     { type: 'raw', data: '\x1D\x56\x41\x00' },  // CUT
     { type: 'html', data: '<html>...Receipt 2...</html>' },
     { type: 'raw', data: '\x1D\x56\x41\x00' },  // CUT
     { type: 'html', data: '<html>...Receipt 3...</html>' },
     { type: 'raw', data: '\x1D\x56\x41\x00' }   // CUT
   ]
   ```
6. **Send to printer via QZ Tray**
7. **Printer automatically cuts after each receipt**
8. **Disconnect and show success message**

---

## User Requirements

### ⚠️ IMPORTANT: QZ Tray Installation Required

**QZ Tray must be installed on EVERY computer that needs to print thermal receipts.**

This is required because:
- Web browsers cannot directly access local printers for security reasons
- QZ Tray acts as a bridge between the website and the local printer
- It enables sending ESC/POS commands (like auto-cut) to thermal printers
- Works even when website is deployed on Netlify/cloud

### 1. Install QZ Tray (Required on Each Computer)
**Download:** https://qz.io/download/

**Supported Platforms:**
- Windows
- macOS
- Linux

**Installation Steps:**
1. Download QZ Tray for your OS
2. Run installer (one-time setup)
3. Start QZ Tray (runs in system tray/background)
4. QZ Tray must be running when printing

**Deployment Scenario:**
```
Website (Netlify) → Internet → User's Computer (QZ Tray) → Local Printer
```

**Who Needs QZ Tray:**
- ✅ Office staff who print LR receipts
- ✅ Warehouse staff who print thermal receipts
- ✅ Any computer connected to thermal printer
- ❌ Admin viewing reports only (no printing)
- ❌ Mobile users (thermal printing not supported)

### 2. Printer Setup
**⚠️ CRITICAL: Printer Name Must Match EXACTLY**

The printer name in the code must match the **exact name** shown in your system settings.

**How to Find Your Printer Name:**

**Windows:**
1. Open Settings → Devices → Printers & scanners
2. Look for your TVS printer
3. Copy the exact name (e.g., "TVS RP 3230 ABW" or "TVS RP 3230 ABW (Copy 1)")

**macOS:**
1. Open System Preferences → Printers & Scanners
2. Find your TVS printer in the list
3. Copy the exact name

**Linux:**
1. Open System Settings → Printers
2. Find your TVS printer
3. Copy the exact name

**Common Printer Names:**
- `TVS RP 3230 ABW` ✅ (Most common)
- `TVS RP 3230` ❌ (Incomplete)
- `TVS RP 3230 ABW (Copy 1)` ✅ (If multiple printers)
- Bluetooth name ❌ (Use system printer name, not Bluetooth device name)

**Update Configuration:**
Edit `src/utils/qzTrayUtils.js`:
```javascript
export const DEFAULT_THERMAL_PRINTER = "TVS RP 3230 ABW"; // Change to your exact printer name
```

**Printer Connection:**
- USB or Network connection (recommended)
- Bluetooth connection (may work but not recommended for thermal printing)
- Printer must be online and ready
- Drivers must be installed

**Testing Printer Name:**
Open browser console and run:
```javascript
qz.printers.find().then(printers => console.log(printers));
```
This will list all available printer names.

### 3. One-Time Setup Per Computer
Once installed, QZ Tray:
- Starts automatically with computer (optional)
- Runs in background (minimal resources)
- Works with deployed website
- No configuration needed after initial setup

---

## Error Handling

### Common Errors & Solutions:

**1. "QZ Tray is not installed"**
- Solution: Install QZ Tray from https://qz.io/download/

**2. "QZ Tray is not running"**
- Solution: Start QZ Tray application (check system tray)

**3. "Printer not found"**
- Solution: 
  - Check printer is connected and turned on
  - Verify printer name matches "TVS RP 3230"
  - Install printer drivers

**4. "Failed to connect to server"**
- Solution: Check internet connection and backend is running

---

## Testing Checklist

### Before Testing:
- [ ] QZ Tray installed
- [ ] QZ Tray running (check system tray)
- [ ] TVS RP 3230 printer connected
- [ ] Printer is online and has paper
- [ ] Backend is running with new endpoint

### Test Cases:
1. **Print Single LR**
   - Click "Download Thermal" button
   - Verify 3 copies print
   - Verify auto-cut after each copy

2. **Error Handling**
   - Stop QZ Tray → Should show "not running" error
   - Disconnect printer → Should show "printer not found" error

3. **Multiple Prints**
   - Print multiple LRs in sequence
   - Verify no connection issues

---

## Configuration Options

### Change Printer Name:
Edit `src/utils/qzTrayUtils.js`:
```javascript
export const DEFAULT_THERMAL_PRINTER = "Your Printer Name";
```

### Change Cut Type:
Edit `printThermalLRWithAutoCut()` function:
```javascript
// Use full cut instead of partial cut
data: ESC_POS_COMMANDS.FULL_CUT
```

### Change Number of Copies:
Backend controls this in `LRThermal.js` - already set to 3 copies

---

## Benefits

✅ **Automatic Paper Cutting** - No manual cutting needed  
✅ **Consistent Results** - Same cut position every time  
✅ **Faster Workflow** - Reduces manual intervention  
✅ **Professional Output** - Clean, straight cuts  
✅ **Error Prevention** - Reduces paper waste from manual cutting  
✅ **Reusable Code** - Utility functions can be used for other thermal printing  

---

## Future Enhancements

### Possible Improvements:
1. **Printer Selection UI** - Let users choose printer from dropdown
2. **Print Preview** - Show preview before printing
3. **Print Settings** - Configure copies, cut type, etc.
4. **Batch Printing** - Print multiple LRs at once
5. **Print Queue** - Queue multiple print jobs
6. **Status Monitoring** - Show printer status in real-time

---

## Support & Troubleshooting

### QZ Tray Documentation:
- Official Docs: https://qz.io/docs/
- API Reference: https://qz.io/api/
- Community Forum: https://qz.io/support/

### TVS RP 3230 ABW:
- ESC/POS compatible
- Supports partial and full cut
- 80mm thermal paper
- USB and Serial connectivity

---

## Summary

The thermal LR printing now uses QZ Tray to send ESC/POS commands directly to the TVS RP 3230 printer, enabling automatic paper cutting after each receipt. This eliminates the need for manual cutting and provides a more professional, efficient printing workflow.

**Key Change:** Browser `window.print()` → QZ Tray with ESC/POS commands  
**Result:** Automatic paper cutting after each LR copy

---

## FAQ

### Q: Do I need QZ Tray even after deploying to Netlify?
**A: Yes.** QZ Tray must be installed on every computer that prints thermal receipts. The website (deployed on Netlify) communicates with QZ Tray running on the local computer, which then sends commands to the local printer.

### Q: Can I print without installing QZ Tray?
**A: No, not with auto-cut.** Without QZ Tray, you can only use browser's print dialog, which doesn't support ESC/POS commands for auto-cut. You'll need to manually cut the paper.

### Q: Do all users need QZ Tray?
**A: No.** Only users who need to print thermal LR receipts need QZ Tray. Users who only view data or use other features don't need it.

### Q: Is QZ Tray free?
**A: Yes, for basic use.** QZ Tray is free for open-source projects and basic commercial use. Enterprise features require a license.

### Q: Does QZ Tray work on mobile?
**A: No.** QZ Tray is desktop-only (Windows, macOS, Linux). Mobile devices cannot print thermal receipts with auto-cut.

### Q: What if printer name is different?
**A: Update the configuration.** 
1. Find exact printer name in system settings (Windows: Settings → Devices → Printers)
2. Edit `DEFAULT_THERMAL_PRINTER` in `src/utils/qzTrayUtils.js`
3. Use the EXACT name including spaces and special characters
4. Example: `"TVS RP 3230 ABW"` not `"TVS RP 3230"`

**Quick Test:** Open browser console and run:
```javascript
qz.printers.find().then(printers => console.log(printers));
```
This shows all available printer names.

### Q: Can multiple computers share one printer?
**A: Yes.** Each computer needs QZ Tray installed, but they can all print to the same network printer.

### Q: What happens if QZ Tray is not running?
**A: User gets an error message** with instructions to start QZ Tray. The print job won't proceed until QZ Tray is running.
