/**
 * Network Printer Utilities
 * Direct printing to network thermal printers via backend API
 */

/**
 * Print ESC/POS commands to network printer via backend
 * @param {string} escPosCommands - Raw ESC/POS command string
 * @param {string} printerIP - Printer IP address (e.g., "192.168.1.100")
 * @param {number} printerPort - Printer port (default: 9100)
 * @param {string} baseUrl - Backend base URL
 * @returns {Promise<Object>} Response with success status
 */
export const printToNetworkPrinter = async (escPosCommands, printerIP, printerPort = 9100, baseUrl) => {
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
      throw new Error(data.error || data.message || 'Network printing failed');
    }
    
    return {
      success: true,
      message: data.message || 'Print job sent successfully',
      data: data
    };
    
  } catch (error) {
    console.error('Network print error:', error);
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
  try {
    const token = localStorage.getItem('token');
    
    // Fetch parcel data
    const parcelResponse = await fetch(`${baseUrl}/api/parcel/track/${trackingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!parcelResponse.ok) {
      throw new Error('Failed to fetch parcel data');
    }
    
    const parcelData = await parcelResponse.json();
    
    if (!parcelData.flag) {
      throw new Error(parcelData.message || 'Failed to fetch parcel data');
    }
    
    // Generate ESC/POS commands (import dynamically to avoid circular deps)
    const { generateThreeCopies } = await import('./escPosGenerator.js');
    const escPosCommands = generateThreeCopies(parcelData.body);
    
    // Send to network printer via backend
    const printResult = await printToNetworkPrinter(escPosCommands, printerIP, printerPort, baseUrl);
    
    return printResult;
    
  } catch (error) {
    console.error('Network print error:', error);
    return {
      success: false,
      message: error.message || 'Failed to print via network',
      error: error
    };
  }
};

/**
 * Get user-friendly error message for network printing errors
 */
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
      throw new Error(data.error || data.message || 'Failed to discover printers');
    }
    
    return {
      success: true,
      printers: data.printers || [],
      message: data.message || 'Scan complete'
    };
    
  } catch (error) {
    console.error('Printer discovery error:', error);
    return {
      success: false,
      printers: [],
      message: error.message || 'Failed to scan network',
      error: error
    };
  }
};
