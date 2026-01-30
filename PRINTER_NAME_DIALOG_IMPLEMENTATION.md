# Printer Name Dialog Implementation

## Summary of Changes

Added a custom dialog box that prompts users to enter the printer name before printing thermal LR receipts with auto-cut.

---

## What Changed

### 1. **ViewOrderPage.jsx**

#### Added State Variables:
```javascript
const [printerNameDialogOpen, setPrinterNameDialogOpen] = useState(false);
const [printerName, setPrinterName] = useState("TVS-E RP 3230");
```

#### Updated Print Flow:
**Before:**
```javascript
handleLRPrintThermal() → Immediately sends request to server → Prints
```

**After:**
```javascript
handleLRPrintThermal() → Opens dialog → User enters printer name → Confirms → Sends request → Prints
```

#### New Functions:
- `handleLRPrintThermal()` - Opens the printer name dialog
- `handlePrinterNameConfirm()` - Processes the print request with user-provided printer name
- `handlePrinterNameCancel()` - Closes the dialog without printing

#### Added Custom Dialog:
- Material-UI Modal with custom styling
- TextField for printer name input (default: "TVS-E RP 3230")
- Helper text with tip to run `listPrinters()` in console
- Cancel and Print buttons
- Enter key support for quick confirmation
- Dark mode support

### 2. **qzTrayUtils.js**

#### Updated Default Printer:
```javascript
export const DEFAULT_THERMAL_PRINTER = "TVS-E RP 3230";
```

---

## User Experience Flow

### Step 1: User Clicks "Download Thermal" Button
- Button click triggers `handleLRPrintThermal()`
- Dialog opens immediately (no server request yet)

### Step 2: Printer Name Dialog Appears
```
┌─────────────────────────────────────────┐
│         🖨️  Thermal Printer Setup       │
│                                         │
│  Enter the exact printer name as       │
│  shown in your system settings          │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Printer Name                      │ │
│  │ TVS-E RP 3230                     │ │
│  └───────────────────────────────────┘ │
│                                         │
│  💡 Tip: Run listPrinters() in         │
│     browser console to see available   │
│     printers                            │
│                                         │
│     [Cancel]  [Print with Auto-Cut]    │
└─────────────────────────────────────────┘
```

### Step 3: User Options

**Option A: Use Default Name**
- Default value "TVS-E RP 3230" is pre-filled
- User clicks "Print with Auto-Cut" or presses Enter
- Proceeds to printing

**Option B: Enter Custom Name**
- User clears the field
- Types exact printer name (e.g., "TVS RP 3230 ABW")
- Clicks "Print with Auto-Cut" or presses Enter
- Proceeds to printing

**Option C: Cancel**
- User clicks "Cancel" or closes dialog
- No printing occurs
- Dialog closes

### Step 4: Printing Process
Once confirmed:
1. Dialog closes
2. Loading screen shows: "Generating LR Receipt..."
3. Request sent to server: `GET /api/parcel/generate-lr-qz-tray/:trackingId`
4. QZ Tray connects using provided printer name
5. Receipt prints with auto-cut
6. Success message shows printer name used

---

## Benefits

### 1. **Flexibility**
- Users can change printer name without editing code
- Different users can use different printers
- Easy to switch between printers

### 2. **User-Friendly**
- Clear instructions in dialog
- Default value provided
- Helper text with console command
- Enter key support for quick printing

### 3. **Error Prevention**
- Users see printer name before printing
- Can verify/correct name before sending request
- Reduces "Printer not found" errors

### 4. **No Code Changes Needed**
- Users don't need to edit `qzTrayUtils.js`
- No redeployment needed to change printer
- Works for all users with different printer names

---

## Dialog Features

### Visual Design:
- ✅ Printer icon at top
- ✅ Clear title: "Thermal Printer Setup"
- ✅ Descriptive subtitle
- ✅ Large text input field
- ✅ Helper text with console tip
- ✅ Cancel and Confirm buttons
- ✅ Dark mode support
- ✅ Responsive design

### Functionality:
- ✅ Pre-filled with default value
- ✅ Auto-focus on text field
- ✅ Enter key to confirm
- ✅ Escape key to cancel (via Modal)
- ✅ Validation (empty check)
- ✅ Trim whitespace from input
- ✅ Passes printer name to print function

### Styling:
- ✅ Matches app theme colors
- ✅ Dark/light mode support
- ✅ Consistent with other modals
- ✅ Professional appearance
- ✅ Clear visual hierarchy

---

## Code Examples

### Opening the Dialog:
```javascript
// When user clicks "Download Thermal" button
<button onClick={handleLRPrintThermal}>
  <FaPrint /> Download Thermal
</button>

// Function opens dialog
const handleLRPrintThermal = () => {
  setPrinterNameDialogOpen(true);
};
```

### Confirming and Printing:
```javascript
const handlePrinterNameConfirm = async () => {
  setPrinterNameDialogOpen(false);
  
  if (!printerName || printerName.trim() === "") {
    alert("Please enter a printer name");
    return;
  }
  
  try {
    setIsScreenLoadingText("Generating LR Receipt...");
    setIsScreenLoading(true);
    
    // Print with user-provided printer name
    const result = await printThermalLRWithAutoCut(
      id, 
      BASE_URL, 
      printerName.trim()  // User's input
    );
    
    alert(`${result.message}\n\nPrinter: ${printerName}`);
  } catch (error) {
    alert(getQZTrayErrorMessage(error));
  } finally {
    setIsScreenLoading(false);
  }
};
```

---

## Testing the Feature

### Test Case 1: Default Printer Name
1. Click "Download Thermal"
2. Dialog opens with "TVS-E RP 3230"
3. Click "Print with Auto-Cut"
4. Should print if printer exists

### Test Case 2: Custom Printer Name
1. Click "Download Thermal"
2. Clear the field
3. Type your exact printer name
4. Click "Print with Auto-Cut"
5. Should print with your printer

### Test Case 3: Empty Printer Name
1. Click "Download Thermal"
2. Clear the field completely
3. Click "Print with Auto-Cut"
4. Should show error: "Please enter a printer name"

### Test Case 4: Cancel
1. Click "Download Thermal"
2. Click "Cancel"
3. Dialog closes, no printing occurs

### Test Case 5: Enter Key
1. Click "Download Thermal"
2. Type printer name
3. Press Enter
4. Should print (same as clicking button)

### Test Case 6: Wrong Printer Name
1. Click "Download Thermal"
2. Type "NonExistentPrinter"
3. Click "Print with Auto-Cut"
4. Should show error: "Printer not found"

---

## Finding Your Printer Name

### Method 1: Browser Console (Easiest)
```javascript
// Open browser console (F12)
listPrinters()

// Output:
// ✅ Found 2 printer(s):
// 1. "Microsoft Print to PDF"
// 2. "TVS-E RP 3230"
```

### Method 2: System Settings

**Windows:**
1. Settings → Devices → Printers & scanners
2. Look for your TVS printer
3. Copy exact name

**macOS:**
1. System Preferences → Printers & Scanners
2. Find TVS printer
3. Copy exact name

**Linux:**
1. System Settings → Printers
2. Find TVS printer
3. Copy exact name

---

## Common Printer Names

Based on TVS RP 3230 models:

- `"TVS-E RP 3230"` (Default in dialog)
- `"TVS RP 3230 ABW"`
- `"TVS RP 3230"`
- `"RP3230ABW-5BE6"` (Bluetooth name)
- `"TVS-E RP 3230 (Copy 1)"` (Multiple printers)

**Important:** Use the EXACT name from system settings, not the Bluetooth device name.

---

## Troubleshooting

### Dialog doesn't open
- Check browser console for errors
- Verify `handleLRPrintThermal` is called
- Check `printerNameDialogOpen` state

### Printer not found error
- Run `listPrinters()` in console
- Copy exact printer name
- Check printer is connected and on
- Verify QZ Tray is running

### Empty printer name error
- Don't leave field blank
- Enter at least one character
- Use default value if unsure

---

## Future Enhancements

Possible improvements:

1. **Printer Dropdown**
   - Auto-populate with available printers
   - User selects from list instead of typing

2. **Remember Last Used**
   - Save printer name to localStorage
   - Auto-fill with last used printer

3. **Printer Status Check**
   - Show if printer is online/offline
   - Warn before printing if offline

4. **Test Print Button**
   - Add "Test Print" button in dialog
   - Print test page to verify printer works

5. **Printer Favorites**
   - Save multiple printer names
   - Quick switch between favorites

---

## Summary

✅ Added custom dialog for printer name input  
✅ Default value: "TVS-E RP 3230"  
✅ User can change printer name before printing  
✅ No code changes needed to switch printers  
✅ Helper text guides users to find printer name  
✅ Enter key support for quick printing  
✅ Dark mode support  
✅ Validation and error handling  

The printer name dialog provides flexibility and user control while maintaining a professional, user-friendly experience.
