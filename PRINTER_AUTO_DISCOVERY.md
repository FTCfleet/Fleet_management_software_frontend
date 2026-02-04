# Printer Auto-Discovery Implementation

## Summary

Added automatic printer discovery feature that scans the local network to find thermal printers, eliminating the need for users to manually enter IP addresses.

---

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│  USER CLICKS "AUTO-DETECT PRINTER"                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│  FRONTEND                                                │
│  - Shows "Scanning Network..." with spinner             │
│  - Calls: GET /api/parcel/discover-printers            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│  BACKEND                                                 │
│  1. Detects server's IP (e.g., 192.168.1.50)           │
│  2. Extracts subnet (192.168.1)                         │
│  3. Scans 192.168.1.1 to 192.168.1.254                 │
│  4. Checks each IP for open port 9100                   │
│  5. Returns list of IPs with port 9100 open            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│  FRONTEND                                                │
│  - Receives list of printers                            │
│  - Auto-selects first printer                           │
│  - Fills IP and port fields                             │
│  - Shows: "✓ Found 2 printer(s)"                       │
└─────────────────────────────────────────────────────────┘
```

---

## Frontend Changes ✅

### 1. Updated: `src/utils/networkPrintUtils.js`

**Added Function:**
```javascript
discoverNetworkPrinters(baseUrl)
```

**What it does:**
- Calls backend discovery endpoint
- Returns list of discovered printers
- Handles errors gracefully

### 2. Updated: `src/pages/ViewOrderPage.jsx`

**New State:**
```javascript
const [discoveredPrinters, setDiscoveredPrinters] = useState([]);
const [isScanning, setIsScanning] = useState(false);
```

**New Handler:**
```javascript
handleScanNetwork()
```

**What it does:**
- Shows scanning spinner
- Calls discovery API
- Auto-fills first printer's IP/port
- Shows success/error message

**New UI:**
- "🔍 Auto-Detect Printer" button in network printer dialog
- Scanning spinner during scan
- "✓ Found X printer(s)" message after scan

---

## Backend Implementation Needed

### New Endpoint: `GET /api/parcel/discover-printers`

**Controller:** `controllers/printerDiscoveryController.js`

**What it does:**
1. Detects backend server's local IP
2. Extracts subnet (e.g., `192.168.1`)
3. Scans all IPs in subnet (1-254)
4. Checks each IP for open port 9100
5. Returns list of printers found

**Response:**
```json
{
  "success": true,
  "printers": [
    { "ip": "192.168.1.100", "port": 9100 },
    { "ip": "192.168.1.105", "port": 9100 }
  ],
  "message": "Found 2 printer(s) on network"
}
```

**Implementation:**
```javascript
// controllers/printerDiscoveryController.js
const net = require('net');
const os = require('os');

// Get local network subnet
const getLocalSubnet = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        const ip = iface.address;
        const subnet = ip.substring(0, ip.lastIndexOf('.'));
        return subnet;
      }
    }
  }
  return '192.168.1'; // fallback
};

// Check if port is open on IP
const checkPort = (ip, port, timeout = 1000) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    socket.connect(port, ip);
  });
};

// Discover printers on network
exports.discoverPrinters = async (req, res) => {
  try {
    const subnet = getLocalSubnet();
    const port = 9100;
    const printers = [];
    
    console.log(`Scanning ${subnet}.1-254 for printers on port ${port}...`);
    
    // Scan in batches for speed (50 IPs at a time)
    const batchSize = 50;
    for (let i = 1; i <= 254; i += batchSize) {
      const promises = [];
      
      for (let j = i; j < i + batchSize && j <= 254; j++) {
        const ip = `${subnet}.${j}`;
        promises.push(
          checkPort(ip, port).then(isOpen => {
            if (isOpen) {
              console.log(`✓ Found printer at ${ip}:${port}`);
              return { ip, port };
            }
            return null;
          })
        );
      }
      
      const results = await Promise.all(promises);
      printers.push(...results.filter(r => r !== null));
    }
    
    console.log(`Scan complete. Found ${printers.length} printer(s)`);
    
    res.json({
      success: true,
      printers: printers,
      message: `Found ${printers.length} printer(s) on network`
    });
    
  } catch (error) {
    console.error('Printer discovery error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to discover printers',
      details: error.message
    });
  }
};
```

**Route:** `routes/parcelRoutes.js`
```javascript
const printerDiscoveryController = require('../controllers/printerDiscoveryController');

router.route('/discover-printers')
  .get(catchAsync(printerDiscoveryController.discoverPrinters));
```

---

## User Experience

### Before (Manual Entry):
1. User clicks "Print via Network"
2. User must know printer IP
3. User enters: `192.168.1.100`
4. User enters port: `9100`
5. User clicks "Print"

### After (Auto-Discovery):
1. User clicks "Print via Network"
2. User clicks "🔍 Auto-Detect Printer"
3. **System scans network (10-30 seconds)**
4. **System auto-fills IP and port**
5. User clicks "Print"

---

## Performance

### Scan Time:
- **Fast network**: 10-15 seconds
- **Average network**: 15-25 seconds
- **Slow network**: 25-30 seconds

### Optimization:
- Scans 50 IPs in parallel (batches)
- 1 second timeout per IP
- Total: ~6 batches × 1 second = ~6 seconds minimum
- Plus network latency

### Can Be Improved:
- Cache discovered printers (5 min TTL)
- Scan only common IP ranges first (100-200)
- Use mDNS for instant discovery (if supported)

---

## Alternative Methods

### Method 1: Network Scan (Current)
**Pros:**
- ✅ Works with all printers
- ✅ Simple implementation
- ✅ No printer configuration needed

**Cons:**
- ⚠️ Takes 10-30 seconds
- ⚠️ May find non-printer devices on port 9100

### Method 2: SNMP Query
**Pros:**
- ✅ Accurate (identifies actual printers)
- ✅ Gets printer model/name
- ✅ Gets printer status

**Cons:**
- ⚠️ Requires SNMP enabled on printer
- ⚠️ More complex implementation
- ⚠️ Slower than network scan

**Implementation:**
```javascript
const snmp = require('net-snmp');

// Query printer info via SNMP
const queryPrinter = async (ip) => {
  const session = snmp.createSession(ip, 'public');
  const oid = '1.3.6.1.2.1.25.3.2.1.3.1'; // Printer description OID
  
  return new Promise((resolve) => {
    session.get([oid], (error, varbinds) => {
      session.close();
      if (error) {
        resolve(null);
      } else {
        resolve({
          ip: ip,
          name: varbinds[0].value.toString(),
          port: 9100
        });
      }
    });
  });
};
```

### Method 3: mDNS/Bonjour
**Pros:**
- ✅ Very fast (1-2 seconds)
- ✅ Standard protocol
- ✅ Gets printer name/model

**Cons:**
- ⚠️ Requires printer to support mDNS
- ⚠️ May not work on all networks
- ⚠️ Requires additional npm package

**Implementation:**
```javascript
const mdns = require('mdns');

const browser = mdns.createBrowser(mdns.tcp('printer'));

browser.on('serviceUp', (service) => {
  console.log('Found printer:', service.name, service.addresses[0]);
  printers.push({
    ip: service.addresses[0],
    port: service.port,
    name: service.name
  });
});

browser.start();
```

---

## Testing

### Test Scan Endpoint:
```bash
curl http://localhost:8000/api/parcel/discover-printers
```

**Expected Response:**
```json
{
  "success": true,
  "printers": [
    { "ip": "192.168.1.100", "port": 9100 }
  ],
  "message": "Found 1 printer(s) on network"
}
```

### Test from Frontend:
1. Open React app
2. Go to any order
3. Click "Print via Network"
4. Click "🔍 Auto-Detect Printer"
5. Wait 10-30 seconds
6. Should see: "✓ Found X printer(s)"
7. IP field should be auto-filled

---

## Error Handling

### No Printers Found:
```
⚠️ No printers found on network

Make sure:
• Printer is powered on
• Printer is connected to WiFi
• Printer and server are on same network
```

### Scan Failed:
```
❌ Scan failed

[Error message from backend]
```

### Backend Unreachable:
```
❌ Failed to scan network

Please enter printer IP manually
```

---

## Security Considerations

### Current Implementation:
- ⚠️ No authentication on discovery endpoint
- ⚠️ No rate limiting
- ⚠️ Scans entire subnet

### Recommended Improvements:
```javascript
// Add authentication
router.route('/discover-printers')
  .get(authenticateToken, catchAsync(printerDiscoveryController.discoverPrinters));

// Add rate limiting (1 scan per minute per user)
const scanLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1 // 1 request per minute
});

router.route('/discover-printers')
  .get(scanLimiter, catchAsync(printerDiscoveryController.discoverPrinters));

// Add caching (cache results for 5 minutes)
const cache = new Map();

exports.discoverPrinters = async (req, res) => {
  const cacheKey = 'printers';
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return res.json(cached.data);
  }
  
  // ... scan network ...
  
  cache.set(cacheKey, {
    data: result,
    timestamp: Date.now()
  });
  
  res.json(result);
};
```

---

## Files Summary

### Frontend (Complete):
- ✅ `src/utils/networkPrintUtils.js` - Added `discoverNetworkPrinters()`
- ✅ `src/pages/ViewOrderPage.jsx` - Added scan button and handler

### Backend (To Do):
- ⏳ `controllers/printerDiscoveryController.js` - Create controller
- ⏳ `routes/parcelRoutes.js` - Add route

---

## Next Steps

1. ⏳ **Implement backend controller** (copy code from above)
2. ⏳ **Add route** to `parcelRoutes.js`
3. ⏳ **Test scan endpoint** with curl
4. ⏳ **Test from frontend** - click "Auto-Detect Printer"
5. ⏳ **Deploy** to production
6. ✅ **Done!**

---

## Benefits

✅ **User-friendly** - No need to know printer IP  
✅ **Fast setup** - One click to find printer  
✅ **Error-proof** - No typos in IP address  
✅ **Works on mobile** - Same experience everywhere  
✅ **Fallback** - Can still enter IP manually  

---

**Status**: Frontend complete, backend implementation needed  
**Last Updated**: February 2026
