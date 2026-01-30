/**
 * QZ Tray Utility Functions
 * For thermal printer integration with auto-cut support
 */

// Default printer name for TVS RP 3230 ABW
// IMPORTANT: This must match the EXACT printer name in Windows/System settings
// To find your printer name:
// - Windows: Settings → Devices → Printers & scanners
// - macOS: System Preferences → Printers & Scanners
// - Linux: System Settings → Printers
// Current printer: RP3230ABW-5BE6 (Bluetooth name)
export const DEFAULT_THERMAL_PRINTER = "RP3230ABW-5BE6";

// ESC/POS Commands
export const ESC_POS_COMMANDS = {
  PARTIAL_CUT: '\x1D\x56\x41\x00',  // GS V A 0 - Partial cut
  FULL_CUT: '\x1D\x56\x00',         // GS V 0 - Full cut
  FEED_AND_CUT: '\x1B\x64\x03\x1D\x56\x41\x00', // Feed 3 lines then partial cut
};

/**
 * Check if QZ Tray is available
 * @returns {boolean}
 */
export const isQZTrayAvailable = () => {
  return typeof qz !== 'undefined';
};

/**
 * Connect to QZ Tray
 * @returns {Promise<void>}
 */
export const connectQZTray = async () => {
  if (!isQZTrayAvailable()) {
    throw new Error("QZ Tray is not installed");
  }
  
  if (!qz.websocket.isActive()) {
    await qz.websocket.connect();
  }
};

/**
 * Disconnect from QZ Tray
 * @returns {Promise<void>}
 */
export const disconnectQZTray = async () => {
  if (isQZTrayAvailable() && qz.websocket.isActive()) {
    await qz.websocket.disconnect();
  }
};

/**
 * Print thermal LR with auto-cut
 * @param {string} trackingId - The tracking ID of the order
 * @param {string} baseUrl - The base URL for API calls
 * @param {string} printerName - Optional printer name (defaults to "TVS RP 3230 ABW")
 * @returns {Promise<void>}
 */
export const printThermalLRWithAutoCut = async (trackingId, baseUrl, printerName = DEFAULT_THERMAL_PRINTER) => {
  // Check QZ Tray availability
  if (!isQZTrayAvailable()) {
    throw new Error("QZ Tray is not installed. Please install QZ Tray for thermal printing.\n\nDownload from: https://qz.io/download/");
  }

  // Fetch LR data from backend
  const response = await fetch(`${baseUrl}/api/parcel/generate-lr-qz-tray/${trackingId}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch LR data from server");
  }
  
  const data = await response.json();
  
  if (!data.flag) {
    throw new Error(data.message || "Failed to generate LR receipt");
  }

  // Connect to QZ Tray
  await connectQZTray();

  try {
    // Configure printer
    const config = qz.configs.create(printerName);

    // Build print data with auto-cut after each receipt
    const printData = [];
    
    data.receipts.forEach((receiptHtml, index) => {
      // Add receipt HTML with styles
      printData.push({
        type: 'html',
        format: 'plain',
        data: `<html><head><style>${data.styles}</style></head><body>${receiptHtml}</body></html>`
      });
      
      // Add partial cut command after each receipt
      printData.push({
        type: 'raw',
        format: 'plain',
        data: ESC_POS_COMMANDS.PARTIAL_CUT
      });
    });

    // Send to printer
    await qz.print(config, printData);
    
    return {
      success: true,
      message: `Successfully printed ${data.receipts.length} copies with auto-cut`,
      copies: data.receipts.length
    };
    
  } finally {
    // Always disconnect, even if printing fails
    await disconnectQZTray();
  }
};

/**
 * Get list of available printers
 * @returns {Promise<Array<string>>}
 */
export const getAvailablePrinters = async () => {
  if (!isQZTrayAvailable()) {
    throw new Error("QZ Tray is not installed");
  }
  
  await connectQZTray();
  
  try {
    const printers = await qz.printers.find();
    console.log("Available printers:", printers); // Log for debugging
    return printers;
  } finally {
    await disconnectQZTray();
  }
};

/**
 * Find printer by partial name match
 * Useful when exact printer name is unknown
 * @param {string} partialName - Part of the printer name (e.g., "TVS" or "3230")
 * @returns {Promise<string|null>}
 */
export const findPrinterByPartialName = async (partialName) => {
  const printers = await getAvailablePrinters();
  const found = printers.find(printer => 
    printer.toLowerCase().includes(partialName.toLowerCase())
  );
  return found || null;
};

/**
 * Get user-friendly error message for QZ Tray errors
 * @param {Error} error
 * @returns {string}
 */
export const getQZTrayErrorMessage = (error) => {
  const errorMsg = error.message || "";
  
  if (errorMsg.includes("Unable to establish connection") || errorMsg.includes("not running")) {
    return "QZ Tray is not running. Please start QZ Tray and try again.\n\nDownload from: https://qz.io/download/";
  }
  
  if (errorMsg.includes("Printer not found") || errorMsg.includes("No printers found")) {
    return "Printer not found. Please check:\n1. Printer is connected and turned on\n2. Printer name matches 'RP3230ABW-5BE6'\n3. Printer drivers are installed\n\nTip: Check exact printer name in system settings";
  }
  
  if (errorMsg.includes("not installed")) {
    return "QZ Tray is not installed. Please install QZ Tray for thermal printing.\n\nDownload from: https://qz.io/download/";
  }
  
  if (errorMsg.includes("Failed to fetch")) {
    return "Failed to connect to server. Please check your internet connection.";
  }
  
  return errorMsg || "An unknown error occurred while printing";
};
