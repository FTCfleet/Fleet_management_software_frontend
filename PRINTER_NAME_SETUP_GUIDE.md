# Printer Name Setup Guide

## Quick Answer

**Use the EXACT printer name from your system settings, NOT the Bluetooth name.**

For TVS RP 3230 ABW, the printer name is likely:
```javascript
"TVS RP 3230 ABW"
```

---

## How to Find Your Printer Name

### Method 1: Using Browser Console (Easiest)

1. Open your website in browser
2. Press `F12` to open Developer Tools
3. Go to "Console" tab
4. Type: `runDiagnostics()` and press Enter
5. Copy the exact printer name shown

**Example Output:**
```
✅ Found 1 TVS printer(s):
1. "TVS RP 3230 ABW"

💡 Use this exact name in your code:
export const DEFAULT_THERMAL_PRINTER = "TVS RP 3230 ABW";
```

### Method 2: System Settings

**Windows:**
1. Open Settings (Win + I)
2. Go to: Devices → Printers & scanners
3. Find your TVS printer
4. Copy the EXACT name (including spaces)

**macOS:**
1. Open System Preferences
2. Go to: Printers & Scanners
3. Find your TVS printer in the list
4. Copy the exact name

**Linux:**
1. Open System Settings
2. Go to: Printers
3. Find your TVS printer
4. Copy the exact name

---

## Common Printer Names

✅ **Correct Examples:**
- `"TVS RP 3230 ABW"`
- `"TVS RP 3230 ABW (Copy 1)"` (if multiple printers)
- `"TVS RP 3230 ABW on USB001"`

❌ **Incorrect Examples:**
- `"TVS RP 3230"` (missing "ABW")
- `"TVS"` (too short)
- `"Bluetooth: TVS RP 3230"` (Bluetooth device name, not printer name)
- `"RP 3230 ABW"` (missing "TVS")

---

## Update Configuration

Once you know the exact printer name:

1. Open: `src/utils/qzTrayUtils.js`
2. Find this line:
   ```javascript
   export const DEFAULT_THERMAL_PRINTER = "TVS RP 3230 ABW";
   ```
3. Replace with your exact printer name:
   ```javascript
   export const DEFAULT_THERMAL_PRINTER = "Your Exact Printer Name";
   ```
4. Save the file
5. Refresh your website

---

## Testing Commands

Open browser console (F12) and use these commands:

### 1. Run Complete Diagnostics
```javascript
runDiagnostics()
```
Shows everything: QZ Tray status, all printers, TVS printer detection

### 2. List All Printers
```javascript
listPrinters()
```
Shows all available printer names

### 3. Find TVS Printer
```javascript
findTVSPrinter()
```
Automatically finds TVS printers

### 4. Test Print
```javascript
testPrint("TVS RP 3230 ABW")
```
Sends a test print to verify printer name is correct

---

## Troubleshooting

### Error: "Cannot find printer with name 'TVS RP 3230'"

**Problem:** Printer name doesn't match exactly

**Solution:**
1. Run `listPrinters()` in console
2. Copy the EXACT name shown
3. Update `DEFAULT_THERMAL_PRINTER` in `qzTrayUtils.js`

### Error: "QZ Tray is not running"

**Problem:** QZ Tray application is not started

**Solution:**
1. Start QZ Tray application
2. Check system tray for QZ Tray icon
3. Try printing again

### Error: "No printers found"

**Problem:** Printer not connected or drivers not installed

**Solution:**
1. Check printer is turned on
2. Check USB/Network cable is connected
3. Install printer drivers
4. Verify printer appears in system settings

---

## Important Notes

### Bluetooth vs System Printer Name

- **Bluetooth Name:** Device name when pairing (e.g., "TVS-RP3230-BT")
- **System Printer Name:** Name in printer settings (e.g., "TVS RP 3230 ABW")

**Use the System Printer Name, NOT the Bluetooth name!**

### Why Exact Name Matters

QZ Tray searches for printers by exact name match. Even a small difference will cause "Printer not found" error:

- ✅ `"TVS RP 3230 ABW"` = Works
- ❌ `"TVS RP 3230"` = Fails (missing "ABW")
- ❌ `"tvs rp 3230 abw"` = Fails (wrong case)
- ❌ `"TVS  RP 3230 ABW"` = Fails (extra space)

### Multiple Printers

If you have multiple TVS printers, Windows may add numbers:
- First printer: `"TVS RP 3230 ABW"`
- Second printer: `"TVS RP 3230 ABW (Copy 1)"`
- Third printer: `"TVS RP 3230 ABW (Copy 2)"`

Use the exact name for the printer you want to use.

---

## Quick Setup Checklist

- [ ] QZ Tray installed and running
- [ ] Printer connected and turned on
- [ ] Printer drivers installed
- [ ] Printer appears in system settings
- [ ] Ran `runDiagnostics()` in browser console
- [ ] Copied exact printer name
- [ ] Updated `DEFAULT_THERMAL_PRINTER` in `qzTrayUtils.js`
- [ ] Tested with `testPrint("Your Printer Name")`
- [ ] Successfully printed test page

---

## Need Help?

1. **Run diagnostics first:**
   ```javascript
   runDiagnostics()
   ```

2. **Check the output** - it will tell you exactly what's wrong

3. **Common issues:**
   - QZ Tray not running → Start QZ Tray
   - Printer not found → Check printer name
   - No printers → Check connections and drivers

4. **Still stuck?** Share the output of `runDiagnostics()` for help
