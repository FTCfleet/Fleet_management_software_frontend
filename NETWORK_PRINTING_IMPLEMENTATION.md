# Network Printing Implementation Summary

## Overview
Added direct network printing capability to bypass QZ Tray and send ESC/POS commands directly to network thermal printers via backend API.

## Frontend Changes

### 1. New Utility File: `src/utils/networkPrintUtils.js`
**Functions:**
- `printToNetworkPrinter()` - Sends ESC/POS commands to backend API
- `printThermalLRNetwork()` - Fetches parcel data, generates ESC/POS, and prints
- `getNetworkPrintErrorMessage()` - User-friendly error messages

**Features:**
- Sends raw ESC/POS commands to backend endpoint `/api/print/thermal-network`
- Handles network errors (connection refused, timeout, host unreachable)
- Saves printer settings to localStorage
- Reuses existing ESC/POS generator

### 2. Updated: `src/pages/ViewOrderPage.jsx`
**New State:**
```javascript
const [networkPrinterDialogOpen, setNetworkPrinterDialogOpen] = useState(false);
const [printerIP, setPrinterIP] = useState("192.168.1.100");
const [printerPort, setPrinterPort] = useState("9100");
```

**New Handlers:**
- `handleNetworkPrint()` - Opens network printer dialog
- `handleNetworkPrintConfirm()` - Validates inputs and sends print job
- `handleNetworkPrintCancel()` - Closes dialog

**New UI Elements:**
- "Print via Network" button
- Network Printer Setup dialog with IP and port inputs
- Loads saved settings from localStorage on mount

**Button Changes:**
- "Print Thermal LR" → "Print via QZ Tray" (clarified)
- Added "Print via Network" button
- Uncommented "Preview Thermal" button

## Backend Requirements (TO BE IMPLEMENTED)

### New Endpoint: `POST /api/print/thermal-network`

**Request Body:**
```json
{
  "escPosCommands": "ESC/POS command string",
  "printerIP": "192.168.1.100",
  "printerPort": 9100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Print job sent successfully"
}
```

**Implementation (Node.js):**
```javascript
const net = require('net');

app.post('/api/print/thermal-network', async (req, res) => {
  const { escPosCommands, printerIP, printerPort } = req.body;
  
  const client = new net.Socket();
  
  client.connect(printerPort, printerIP, () => {
    const buffer = Buffer.from(escPosCommands, 'binary');
    client.write(buffer);
    client.end();
  });
  
  client.on('close', () => {
    res.json({ success: true, message: 'Print job sent successfully' });
  });
  
  client.on('error', (err) => {
    res.status(500).json({ success: false, error: err.message });
  });
});
```

## User Flow

1. User clicks "Print via Network" button
2. Dialog opens with IP and port fields (pre-filled from localStorage)
3. User enters/confirms printer IP (e.g., 192.168.1.100) and port (default: 9100)
4. User clicks "Print via Network"
5. Frontend:
   - Validates inputs
   - Fetches parcel data from `/api/parcel/track/:id`
   - Generates ESC/POS commands using `generateThreeCopies()`
   - Sends to backend `/api/print/thermal-network`
6. Backend:
   - Opens TCP connection to printer IP:port
   - Sends raw ESC/POS bytes
   - Returns success/error
7. User sees success/error alert

## Printer Configuration

### Find Printer IP:
1. Print test page from printer settings
2. Check router's connected devices
3. Use printer's control panel

### Common Ports:
- **9100** - Raw TCP/IP (most common for ESC/POS)
- **9101** - Alternative port
- **515** - LPD (Line Printer Daemon)

### Network Requirements:
- Printer must be on same network as backend server
- Firewall must allow outbound connections to printer port
- Printer must have "Raw TCP/IP" or "Port 9100" printing enabled

## Advantages vs QZ Tray

| Feature | QZ Tray | Network Printing |
|---------|---------|------------------|
| Installation | Required on each PC | None |
| Mobile Support | No | Yes |
| Remote Access | No | Yes (if VPN) |
| USB Printers | Yes | No |
| Network Printers | Yes | Yes |
| Browser Prompts | Yes | No |
| Deployment | Complex | Simple |

## Error Handling

Frontend shows user-friendly messages for:
- **ECONNREFUSED** - Printer offline or wrong IP
- **ETIMEDOUT** - Printer not responding
- **EHOSTUNREACH** - Printer not on network
- **Failed to fetch** - Backend server unreachable

## Testing Checklist

### Frontend (Already Done):
- ✅ Network print button added
- ✅ Dialog with IP/port inputs
- ✅ Input validation
- ✅ localStorage persistence
- ✅ Error handling
- ✅ Loading states

### Backend (To Do):
- ⏳ Create `/api/print/thermal-network` endpoint
- ⏳ TCP socket connection to printer
- ⏳ Send raw ESC/POS bytes
- ⏳ Error handling
- ⏳ Test with actual printer

### Integration Testing:
- ⏳ Test with printer on same network
- ⏳ Test with wrong IP (should show error)
- ⏳ Test with printer offline (should show error)
- ⏳ Test with firewall blocking (should show timeout)
- ⏳ Verify 3 copies print correctly
- ⏳ Verify auto-cut works

## Files Modified

1. **Created:** `src/utils/networkPrintUtils.js` (98 lines)
2. **Modified:** `src/pages/ViewOrderPage.jsx` (added ~120 lines)

## Next Steps

1. **Implement backend endpoint** `/api/print/thermal-network`
2. **Test with actual network printer**
3. **Add printer management UI** (optional - save multiple printers)
4. **Add printer discovery** (optional - scan network for printers)
5. **Deploy and test in production**

## Notes

- ESC/POS commands are generated in frontend (no backend changes needed)
- Same `generateThreeCopies()` function used for both QZ Tray and network printing
- Printer settings saved to localStorage for convenience
- Both printing methods available - users can choose based on setup
