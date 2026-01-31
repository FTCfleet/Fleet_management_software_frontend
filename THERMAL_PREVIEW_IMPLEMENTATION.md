# Thermal Receipt Preview Implementation

## ✅ Complete!

I've implemented a thermal receipt preview that shows exactly how the receipt will look on 78mm thermal paper before printing.

---

## What Was Created

### 1. **ThermalReceiptPreview Component** (`src/components/ThermalReceiptPreview.jsx`)
- Parses ESC/POS commands and renders them visually
- Shows receipt on 78mm width paper (actual thermal paper size)
- Uses monospace font (Courier New) like thermal printers
- Interprets ESC/POS formatting:
  - **Bold text** (ESC ! 0x10)
  - **Double height** (ESC ! 0x30)
  - **Alignment** (left/center/right)
  - **Cut marks** (GS V commands shown as ✂️ with dashed lines)

### 2. **useThermalPreview Hook** (`src/hooks/useThermalPreview.js`)
- Manages preview state
- Functions: `showPreview()`, `closePreview()`

### 3. **Updated ViewOrderPage** (`src/pages/ViewOrderPage.jsx`)
- Added "Preview Thermal" button
- Fetches parcel data and generates ESC/POS
- Shows preview before printing
- Can print directly from preview

---

## How It Works

### User Flow:
```
1. User clicks "Preview Thermal" button
   ↓
2. Frontend fetches parcel data from /api/parcel/track/:id
   ↓
3. Generates ESC/POS commands using escPosGenerator.js
   ↓
4. Shows preview in modal (78mm width, monospace font)
   ↓
5. User can:
   - Close preview
   - Print with QZ Tray (opens printer dialog)
```

### Preview Features:
✅ **Exact 78mm width** - Same as thermal paper  
✅ **Monospace font** - Courier New (like thermal printers)  
✅ **ESC/POS interpretation** - Bold, double height, alignment  
✅ **Cut marks shown** - Visual indication of where paper cuts  
✅ **Scrollable** - Can preview long receipts  
✅ **Print button** - Direct print from preview  

---

## Preview Component Features

### ESC/POS Commands Interpreted:

| Command | Effect | Preview Shows |
|---------|--------|---------------|
| `ESC @` | Initialize | Resets formatting |
| `ESC ! 0x00` | Normal font | Regular text |
| `ESC ! 0x10` | Bold | **Bold text** |
| `ESC ! 0x30` | Double height + bold | **Large bold text** |
| `ESC a 0x00` | Left align | Text aligned left |
| `ESC a 0x01` | Center align | Text centered |
| `ESC a 0x02` | Right align | Text aligned right |
| `GS V A 0` | Partial cut | ✂️ with dashed lines |
| `\n` | Line feed | New line |

### Visual Styling:
- **Paper**: White background, 78mm width
- **Font**: Courier New, 11px (normal), 18px (double height)
- **Margins**: 10mm top/bottom, 5mm left/right
- **Cut marks**: Dashed border with scissors emoji
- **Shadow**: Realistic paper shadow effect

---

## Usage

### In ViewOrderPage:

```javascript
// 1. Import components
import ThermalReceiptPreview from "../components/ThermalReceiptPreview";
import { useThermalPreview } from "../hooks/useThermalPreview";
import { generateCopiesArray } from "../utils/escPosGenerator";

// 2. Use hook
const { previewData, isPreviewOpen, showPreview, closePreview } = useThermalPreview();

// 3. Generate preview
const handleThermalPreview = async () => {
  const response = await fetch(`/api/parcel/track/${id}`);
  const data = await response.json();
  const escPosReceipts = generateCopiesArray(data.body);
  showPreview(escPosReceipts[0]); // Show first copy
};

// 4. Render preview
{isPreviewOpen && previewData && (
  <ThermalReceiptPreview
    escPosData={previewData}
    onClose={closePreview}
    onPrint={handlePrintFromPreview}
  />
)}
```

---

## Benefits

### ✅ **See Before Print**
- Preview exactly how receipt will look
- Verify data is correct
- Check formatting

### ✅ **No Wasted Paper**
- Catch errors before printing
- Verify printer settings
- Test without QZ Tray

### ✅ **Better UX**
- Visual confirmation
- Easy to understand
- Professional appearance

### ✅ **Debugging Tool**
- See ESC/POS interpretation
- Verify command parsing
- Test formatting changes

---

## Buttons on ViewOrderPage

### 1. **Download Receipt** (PDF)
- Downloads full A4 LR receipt
- For official records

### 2. **Preview Thermal** (NEW!)
- Shows thermal receipt preview
- 78mm width, monospace font
- Can print from preview

### 3. **Print Thermal (Auto-Cut)**
- Opens printer name dialog
- Prints directly with QZ Tray
- 3 copies with auto-cut

### 4. **Preview Thermal LR** (Old)
- Backend-generated PDF preview
- Opens in browser print dialog

---

## Preview Modal Layout

```
┌─────────────────────────────────┐
│ Thermal Receipt Preview    [X]  │ ← Header
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐ │
│  │ Date: 28/01/2026          │ │
│  │ LR No: HYD02-12345        │ │
│  │ ─────────────────────────  │ │
│  │   FRIENDS TRANSPORT CO.   │ │ ← 78mm width
│  │ HYD-01 Ph.: 1234567890    │ │   Monospace font
│  │ ...                       │ │   Scrollable
│  │ ✂️ ─────────────────────── │ │ ← Cut mark
│  └───────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│ [Print with QZ Tray]  [Close]  │ ← Footer
└─────────────────────────────────┘
```

---

## Technical Details

### Preview Parsing:
The component parses ESC/POS byte-by-byte:
1. Detects ESC commands (`\x1B`)
2. Interprets formatting codes
3. Applies styles to text
4. Renders with React/MUI

### Styling:
- Uses inline styles for precise control
- Monospace font ensures character alignment
- 78mm width matches thermal paper
- Line height matches thermal printer spacing

### Performance:
- Lightweight parsing
- No external dependencies
- Fast rendering
- Smooth scrolling

---

## Future Enhancements

### Possible Improvements:
1. **Multiple copies preview** - Show all 3 copies
2. **Zoom controls** - Zoom in/out
3. **Print settings** - Configure copies, cut type
4. **Save as image** - Export preview as PNG
5. **Compare view** - Side-by-side with actual print
6. **Dark mode** - Dark paper background option

---

## Testing

### Test Preview:
1. Go to any order page
2. Click "Preview Thermal" button
3. Verify:
   - ✅ Receipt shows in 78mm width
   - ✅ Text is monospace (Courier New)
   - ✅ Bold text appears bold
   - ✅ Center-aligned text is centered
   - ✅ Cut mark shows at bottom
   - ✅ All data is correct

### Test Print from Preview:
1. Open preview
2. Click "Print with QZ Tray"
3. Enter printer name
4. Verify prints correctly

---

## Summary

Created a thermal receipt preview that:
- ✅ Shows exact 78mm thermal paper width
- ✅ Uses monospace font like thermal printers
- ✅ Interprets ESC/POS commands visually
- ✅ Allows printing directly from preview
- ✅ Helps verify data before printing
- ✅ No wasted paper or test prints needed

The preview gives users confidence that their thermal receipt will print correctly before sending to the printer!
