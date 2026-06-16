/**
 * Network Printer Utilities
 * Direct printing to network thermal printers via backend API
 */

const BASE_URL = import.meta.env.VITE_BASE_URL;

const remoteLog = async (level, message, data = {}) => {
  try {
    const token = localStorage.getItem('token');
    await fetch(`${BASE_URL}/api/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ level, message, data, timestamp: new Date().toISOString() })
    });
  } catch (e) {}
};

/**
 * Print ESC/POS commands to network printer via backend
 * @param {string} escPosCommands - Raw ESC/POS command string
 * @param {string} printerIP - Printer IP address (e.g., "192.168.1.100")
 * @param {number} printerPort - Printer port (default: 9100)
 * @param {string} baseUrl - Backend base URL
 * @returns {Promise<Object>} Response with success status
 */
export const printToNetworkPrinter = async (escPosCommands, printerIP, printerPort = 9100, baseUrl) => {
  await remoteLog('info', 'printToNetworkPrinter called', { printerIP, printerPort });
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${baseUrl}/api/parcel/print/thermal-network`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        escPosCommands: escPosCommands,
        printerIP: printerIP,
        printerPort: printerPort
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const err = new Error(data.error || data.message || 'Network printing failed');
      await remoteLog('error', 'Network printer API error', { printerIP, printerPort, status: response.status, message: err.message });
      throw err;
    }

    await remoteLog('info', 'Network print successful', { printerIP, printerPort });
    return {
      success: true,
      message: data.message || 'Print job sent successfully',
      data: data
    };

  } catch (error) {
    await remoteLog('error', 'printToNetworkPrinter exception', { printerIP, printerPort, error: error.message });
    return {
      success: false,
      message: error.message || 'Failed to connect to printer',
      error: error
    };
  }
};

/**
 * Print thermal LR via network printer
 * @param {string} trackingId - LR tracking ID
 * @param {string} baseUrl - Backend base URL
 * @param {string} printerIP - Printer IP address
 * @param {number} printerPort - Printer port (default: 9100)
 * @returns {Promise<Object>} Response with success status
 */
export const printThermalLRNetwork = async (trackingId, baseUrl, printerIP, printerPort = 9100) => {
  await remoteLog('info', 'printThermalLRNetwork called', { trackingId, printerIP, printerPort });
  try {
    const token = localStorage.getItem('token');

    const parcelResponse = await fetch(`${baseUrl}/api/parcel/track/${trackingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!parcelResponse.ok) {
      await remoteLog('error', 'Failed to fetch parcel data for network print', { trackingId, status: parcelResponse.status });
      throw new Error('Failed to fetch parcel data');
    }

    const parcelData = await parcelResponse.json();

    if (!parcelData.flag) {
      await remoteLog('error', 'Parcel data error for network print', { trackingId, message: parcelData.message });
      throw new Error(parcelData.message || 'Failed to fetch parcel data');
    }

    const { generateThreeCopies } = await import('./escPosGenerator.js');
    const escPosCommands = generateThreeCopies(parcelData.body);

    const printResult = await printToNetworkPrinter(escPosCommands, printerIP, printerPort, baseUrl);
    return printResult;

  } catch (error) {
    await remoteLog('error', 'printThermalLRNetwork exception', { trackingId, error: error.message });
    return {
      success: false,
      message: error.message || 'Failed to print via network',
      error: error
    };
  }
};

/**
 * Print barcode labels to network printer (ZPL/BPLZ)
 * @param {string} trackingId
 * @param {number} noOfGoods
 * @param {number} count - number of labels
 * @param {string} printerIP
 * @param {number} printerPort
 * @returns {Promise<Object>}
 */
export const printBarcodeViaNetwork = async (trackingId, noOfGoods, count = 1, printerIP, printerPort = 9100) => {
  await remoteLog('info', 'printBarcodeViaNetwork called', { trackingId, noOfGoods, count, printerIP, printerPort });
  try {
    const { generateBPLZBarcode } = await import('./qzTrayUtils.js');
    const zplData = generateBPLZBarcode(trackingId, noOfGoods, count);
    const token = localStorage.getItem('token');

    const response = await fetch(`${BASE_URL}/api/parcel/print/network-raw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ rawData: zplData, printerIP, printerPort })
    });

    const data = await response.json();

    if (!response.ok) {
      const err = new Error(data.error || data.message || 'Network barcode print failed');
      await remoteLog('error', 'Network barcode print API error', { printerIP, printerPort, message: err.message });
      throw err;
    }

    await remoteLog('info', 'Network barcode print successful', { trackingId, printerIP });
    return { success: true, message: data.message || `Printed ${count} label(s) successfully` };

  } catch (error) {
    await remoteLog('error', 'printBarcodeViaNetwork exception', { trackingId, error: error.message });
    throw error;
  }
};

/**
 * Get/set network barcode printer config from localStorage
 */
export const getNetworkBarcodeConfig = () => ({
  ip: localStorage.getItem('networkBarcodePrinterIP') || '',
  port: parseInt(localStorage.getItem('networkBarcodePrinterPort') || '9100', 10),
});

export const saveNetworkBarcodeConfig = (ip, port = 9100) => {
  localStorage.setItem('networkBarcodePrinterIP', ip.trim());
  localStorage.setItem('networkBarcodePrinterPort', String(port));
};


export const getNetworkPrintErrorMessage = (error) => {
  const errorMsg = error?.message || error?.toString() || '';
  
  if (errorMsg.includes('ECONNREFUSED')) {
    return '❌ Cannot connect to printer\n\nPossible causes:\n• Printer is offline or turned off\n• Wrong IP address\n• Printer port is blocked\n• Printer not on same network';
  }
  
  if (errorMsg.includes('ETIMEDOUT')) {
    return '❌ Connection timeout\n\nPossible causes:\n• Printer is not responding\n• Network firewall blocking connection\n• Wrong IP address';
  }
  
  if (errorMsg.includes('EHOSTUNREACH')) {
    return '❌ Cannot reach printer\n\nPossible causes:\n• Printer not on network\n• Wrong IP address\n• Network configuration issue';
  }
  
  if (errorMsg.includes('Failed to fetch')) {
    return '❌ Cannot connect to backend server\n\nPlease check your internet connection';
  }
  
  return `❌ Network printing failed\n\n${errorMsg}`;
};

/**
 * Discover printers on local network
 * @param {string} baseUrl - Backend base URL
 * @returns {Promise<Object>} List of discovered printers
 */
export const discoverNetworkPrinters = async (baseUrl) => {
  await remoteLog('info', 'discoverNetworkPrinters called');
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${baseUrl}/api/parcel/print/discover-printers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      const err = new Error(data.error || data.message || 'Failed to discover printers');
      await remoteLog('error', 'Printer discovery API error', { message: err.message });
      throw err;
    }

    await remoteLog('info', 'Printer discovery complete', { count: (data.printers || []).length });
    return {
      success: true,
      printers: data.printers || [],
      message: data.message || 'Scan complete'
    };

  } catch (error) {
    await remoteLog('error', 'discoverNetworkPrinters exception', { error: error.message });
    return {
      success: false,
      printers: [],
      message: error.message || 'Failed to scan network',
      error: error
    };
  }
};
