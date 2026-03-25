/**
 * QZ Tray Utility Functions
 * For thermal printer integration with auto-cut support
 */

// Default printer name for TVS-E RP 3230
// IMPORTANT: This must match the EXACT printer name in Windows/System settings
// To find your printer name:
// - Windows: Settings → Devices → Printers & scanners
// - macOS: System Preferences → Printers & Scanners
// - Linux: System Settings → Printers
// Or run listPrinters() in browser console to see all available printers
export const DEFAULT_THERMAL_PRINTER = "TVS-E RP 3230";
const BASE_URL = import.meta.env.VITE_BASE_URL;

// QZ Tray Certificate Configuration
// To stop the "unverified certificate" warnings, you need to sign your requests
// Follow these steps:

// OPTION 1: Use QZ Tray's Digital Certificate (Recommended for Production)
// 1. Purchase a code signing certificate from QZ Tray: https://qz.io/buy/
// 2. Download your certificate files (private key + certificate)
// 3. Replace the certificate strings below with your actual certificate

// OPTION 2: Use Self-Signed Certificate (For Development/Testing)
// 1. Generate a self-signed certificate using QZ Tray's tool
// 2. Add the certificate to QZ Tray's trusted list
// 3. Instructions: https://qz.io/wiki/using-a-self-signed-certificate

// Certificate configuration (replace with your actual certificate)
const QZ_CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIIEYTCCA0mgAwIBAgIUNmFGnf0Q2Vbnso4Oif5eD0FkPsMwDQYJKoZIhvcNAQEL
BQAwgb4xCzAJBgNVBAYTAklOMRIwEAYDVQQIDAlUZWxhbmdhbmExEjAQBgNVBAcM
CUh5ZGVyYWJhZDEeMBwGA1UECgwVRnJpZW5kcyBUcmFuc3BvcnQgQ28uMRMwEQYD
VQQLDApGVEMgU2VydmVyMRwwGgYDVQQDDBNmcmllbmRzdHJhbnNwb3J0LmluMTQw
MgYJKoZIhvcNAQkBFiVmcmllbmRzdHJhbnNwb3J0Y29ycG9yYXRpb25AZ21haWwu
Y29tMCAXDTI2MDMyNTE3NDk0NVoYDzIxMjYwMzAxMTc0OTQ1WjCBvjELMAkGA1UE
BhMCSU4xEjAQBgNVBAgMCVRlbGFuZ2FuYTESMBAGA1UEBwwJSHlkZXJhYmFkMR4w
HAYDVQQKDBVGcmllbmRzIFRyYW5zcG9ydCBDby4xEzARBgNVBAsMCkZUQyBTZXJ2
ZXIxHDAaBgNVBAMME2ZyaWVuZHN0cmFuc3BvcnQuaW4xNDAyBgkqhkiG9w0BCQEW
JWZyaWVuZHN0cmFuc3BvcnRjb3Jwb3JhdGlvbkBnbWFpbC5jb20wggEiMA0GCSqG
SIb3DQEBAQUAA4IBDwAwggEKAoIBAQC1gD3PeB2nxpBQcyazS16OrxSPn6UKYizG
nvk6FldgMhIzro/OlUHXLG3hOZQ2LSO1qb1v+nUn2XGyJaAO18hBVFyMik8HGbqU
/ZEetBjreoODhChVZC2MqapMfcV9Nh/aczMCdaf4vn/Ghn6ZdHK5TeTZDetB2VQ2
NV3ro5nK50vdg2Z0XtkMG8iRzQJZLFY3CTQwwL0WJ09pgYeJTA4FCe8/2kH32UZT
T1vF5zOMFKxe4KVNgAn3cq8hjWrmQcIjgYTYLwnedqzsN3dk17DQfWGrGSeovEXC
ejnVsQyUg9E3Nskbg4WKBaViFEpDDJ68XpCtnVOB0mmjlI1EZXDrAgMBAAGjUzBR
MB0GA1UdDgQWBBSFgEU4+eDbgoKCZdlqy9T+l5Jv9jAfBgNVHSMEGDAWgBSFgEU4
+eDbgoKCZdlqy9T+l5Jv9jAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUA
A4IBAQB6hSDUwebA5C/hEvkBtKxcnwAmPaneisBG61mNLvHaMM94BUZZ+UrED4kD
nmIXucRQx0+VupKE/YkZa1jhA2o0EHBFx7BYLES2Cgm+zn3heLN7me9Ni+s94cWg
R/TKQ4MuaGy4odpH3sQZSLbBCfNjFyv7pWKL6KJSDBXNNHlL6BGKxUkrEfDrdTU3
nKLChfC+mFW7Mb3ZB3C1AlvK5Dj6jjIg9SwulKnXfCNcOiHV41Yagj2XLSgwzM7l
SlsIRH98xp/jPbtm3J+ppptWE6U1WyBnxn3WX7h0KxiIr4koGneDPbSMqVFgiH5J
Q567z18qGVKaMpce9g/mxdcu1odO
-----END CERTIFICATE-----`;

/**
 * Configure QZ Tray security with certificate
 */
const configureQZSecurity = async () => {
  if (!window.qz) return;
  // console.log(QZ_CERTIFICATE);

  qz.security.setCertificatePromise((resolve) => {
    resolve(QZ_CERTIFICATE);
  });

  qz.security.setSignaturePromise((toSign) => {
    return function(resolve, reject) {
      fetch(`${BASE_URL}/api/qz-sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: toSign })
      })
        .then(res => res.text())
        .then(resolve)
        .catch(reject);
    }
  });
};

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

  await configureQZSecurity();

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

  // Fetch parcel data from backend using track endpoint
  const response = await fetch(`${baseUrl}/api/parcel/track/${trackingId}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch parcel data from server");
  }
  
  const data = await response.json();
  
  if (!data.flag) {
    throw new Error(data.message || "Failed to fetch parcel data");
  }

  // Import ESC/POS generator dynamically
  const { generateCopiesArray } = await import('./escPosGenerator.js');
  
  // Generate ESC/POS commands for 3 copies
  // Backend returns data in 'body' field
  const escPosReceipts = generateCopiesArray(data.body);

  // Connect to QZ Tray
  await connectQZTray();

  try {
    // Configure printer
    const config = qz.configs.create(printerName);

    // Build print data - send raw ESC/POS commands
    const printData = escPosReceipts.map(receiptCommands => ({
      type: 'raw',
      format: 'plain',
      data: receiptCommands
    }));

    // Send to printer
    await qz.print(config, printData);
    
    return {
      success: true,
      message: `Successfully printed ${escPosReceipts.length} copies with auto-cut`,
      copies: escPosReceipts.length
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
