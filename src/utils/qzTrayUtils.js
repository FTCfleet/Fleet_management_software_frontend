/**
 * QZ Tray Utility Functions
 * For thermal printer integration with auto-cut support
 * Supports:
 *   - TVS-E RP 3230 (80mm thermal receipt printer)
 *   - TVS LP 46 DLITE (label/barcode printer, TSPL)
 */

// Printer names must match EXACTLY what appears in Windows Settings → Printers & scanners
export const DEFAULT_THERMAL_PRINTER = "TVS-E RP 3230";
export const DEFAULT_BARCODE_PRINTER = "SNBC TVSE LP46 Dlite BPLE";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const remoteLog = async (level, message, data = {}) => {
  try {
    const token = localStorage.getItem('token');
    await fetch(`${BASE_URL}/api/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ level, message, data, timestamp: new Date().toISOString() })
    });
  } catch (e) {
    console.log("Failed to send remote log", { level, message, data, error: e });
  }
};

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
    await remoteLog('error', 'QZ Tray not available');
    throw new Error("QZ Tray is not installed");
  }

  await configureQZSecurity();

  if (!qz.websocket.isActive()) {
    await remoteLog('info', 'Connecting to QZ Tray websocket');
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
  await remoteLog('info', 'printThermalLRWithAutoCut called', { trackingId, printerName });

  if (!isQZTrayAvailable()) {
    await remoteLog('error', 'QZ Tray not installed', { trackingId });
    throw new Error("QZ Tray is not installed. Please install QZ Tray for thermal printing.\n\nDownload from: https://qz.io/download/");
  }

  const response = await fetch(`${baseUrl}/api/parcel/track/${trackingId}`);

  if (!response.ok) {
    await remoteLog('error', 'Failed to fetch parcel data', { trackingId, status: response.status });
    throw new Error("Failed to fetch parcel data from server");
  }

  const data = await response.json();

  if (!data.flag) {
    await remoteLog('error', 'Parcel data fetch returned error', { trackingId, message: data.message });
    throw new Error(data.message || "Failed to fetch parcel data");
  }

  await remoteLog('info', 'Parcel data fetched, generating ESC/POS', { trackingId });

  const { generateCopiesArray } = await import('./escPosGenerator.js');
  const escPosReceipts = generateCopiesArray(data.body);

  await connectQZTray();

  try {
    const config = qz.configs.create(printerName);

    const printData = escPosReceipts.map(receiptCommands => ({
      type: 'raw',
      format: 'plain',
      data: receiptCommands
    }));

    await qz.print(config, printData);
    await remoteLog('info', 'Thermal LR print successful', { trackingId, printerName, copies: escPosReceipts.length });

    return {
      success: true,
      message: `Successfully printed ${escPosReceipts.length} copies with auto-cut`,
      copies: escPosReceipts.length
    };

  } catch (err) {
    await remoteLog('error', 'Thermal LR print failed', { trackingId, printerName, error: err.message });
    throw err;
  } finally {
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
    console.log("Available printers:", printers);
    await remoteLog('info', 'Available printers listed', { printers });
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
    return "Printer not found. Please check:\n1. Printer is connected and turned on\n2. Printer name in system settings matches the configured name\n3. Printer drivers are installed\n\nTip: Check exact printer name in Windows Settings → Printers & scanners";
  }

  if (errorMsg.includes("not installed")) {
    return "QZ Tray is not installed. Please install QZ Tray for thermal printing.\n\nDownload from: https://qz.io/download/";
  }

  if (errorMsg.includes("Failed to fetch")) {
    return "Failed to connect to server. Please check your internet connection.";
  }

  return errorMsg || "An unknown error occurred while printing";
};

/* ------------------------------------------------------------------ */
/* Label Generators — TSPL and BPLZ (ZPL-compatible, SNBC printers)  */
/* ------------------------------------------------------------------ */

// Language stored in localStorage as 'barcodePrinterLanguage': 'tspl' | 'bplz'
// SNBC printers (e.g. SNBC TVSE LP46 Dlite) typically use BPLZ.
// TSC printers typically use TSPL.

const generateTSPLBarcode = (trackingId, count) => {
  const lines = [
    'SIZE 100 mm,50 mm',
    'GAP 3 mm,0 mm',
    'DENSITY 8',
    'DIRECTION 0',
    'CLS',
    'TEXT 20,10,"3",0,1,1,"Friends Transport Co."',
    `BARCODE 20,45,"CODE128",100,1,0,2,2,"${trackingId}"`,
    `PRINT ${count},1`,
    'END',
  ];
  return lines.join('\r\n') + '\r\n';
};

// BPLZ is SNBC's ZPL-compatible dialect. Units are in dots (203 DPI → 8 dots/mm).
// ^XA / ^XZ wrap each label. ^FO = field origin. ^A0N = scalable font.
// ^BCN = Code128. ^FD = field data. ^FS = field separator.
const generateBPLZBarcode = (trackingId, count) => {
  let cmd = '';
  for (let i = 0; i < count; i++) {
    cmd += '^XA\r\n';
    cmd += '^FO30,20^A0N,30,30^FDFriends Transport Co.^FS\r\n';
    cmd += `^FO30,65^BCN,100,Y,N,N^FD${trackingId}^FS\r\n`;
    cmd += '^XZ\r\n';
  }
  return cmd;
};

const buildLabelData = (trackingId, count, language) =>
  language === 'bplz'
    ? generateBPLZBarcode(trackingId, count)
    : generateTSPLBarcode(trackingId, count);

const buildTestData = (language) => {
  const ts = new Date().toLocaleString();
  if (language === 'bplz') {
    return [
      '^XA',
      '^FO30,20^A0N,40,40^FDFTC TEST PRINT^FS',
      '^FO30,80^A0N,25,25^FDPrinter is receiving data!^FS',
      `^FO30,120^A0N,20,20^FD${ts}^FS`,
      '^XZ',
    ].join('\r\n') + '\r\n';
  }
  return [
    'SIZE 100 mm,50 mm',
    'GAP 3 mm,0 mm',
    'DENSITY 10',
    'DIRECTION 0',
    'CLS',
    'TEXT 10,10,"3",0,2,2,"FTC TEST PRINT"',
    'TEXT 10,70,"3",0,1,1,"Printer is receiving data!"',
    `TEXT 10,95,"3",0,1,1,"${ts}"`,
    'PRINT 1,1',
    'END',
  ].join('\r\n') + '\r\n';
};

/* ------------------------------------------------------------------ */

/**
 * Print barcode labels via QZ Tray.
 * Language is read from localStorage key 'barcodePrinterLanguage': 'tspl' | 'bplz' (default 'bplz').
 */
export const printBarcodeLabels = async (trackingId, count = 1, printerName = DEFAULT_BARCODE_PRINTER) => {
  const language = localStorage.getItem('barcodePrinterLanguage') || 'bplz';
  await remoteLog('info', 'printBarcodeLabels called', { trackingId, count, printerName, language });

  if (!isQZTrayAvailable()) {
    await remoteLog('error', 'QZ Tray not available for barcode print', { trackingId });
    throw new Error("QZ Tray is not installed. Please install QZ Tray for barcode printing.\n\nDownload from: https://qz.io/download/");
  }

  await connectQZTray();

  try {
    const config = qz.configs.create(printerName);
    const labelData = buildLabelData(trackingId, count, language);

    await remoteLog('info', 'Sending label to barcode printer', { trackingId, printerName, count, language, labelData });
    await qz.print(config, [{ type: 'raw', format: 'plain', data: labelData }]);
    await remoteLog('info', 'Barcode label print successful', { trackingId, printerName, count, language });

    return { success: true, message: `Successfully printed ${count} barcode label(s)` };

  } catch (err) {
    try {
      const availablePrinters = await qz.printers.find();
      await remoteLog('error', 'Barcode label print failed', { trackingId, printerName, count, language, error: err.message, availablePrinters });
    } catch (_) {
      await remoteLog('error', 'Barcode label print failed', { trackingId, printerName, count, language, error: err.message });
    }
    throw err;
  } finally {
    await disconnectQZTray();
  }
};

/**
 * Send a test label to the barcode printer using the specified language.
 * @param {string} printerName
 * @param {'tspl'|'bplz'} language
 */
export const testBarcodePrinter = async (printerName = DEFAULT_BARCODE_PRINTER, language = 'bplz') => {
  await remoteLog('info', 'testBarcodePrinter called', { printerName, language });

  if (!isQZTrayAvailable()) {
    throw new Error("QZ Tray is not installed.");
  }

  await connectQZTray();

  try {
    const config = qz.configs.create(printerName);
    const testData = buildTestData(language);

    await remoteLog('info', `Sending ${language.toUpperCase()} test label`, { printerName, testData });
    await qz.print(config, [{ type: 'raw', format: 'plain', data: testData }]);
    await remoteLog('info', `${language.toUpperCase()} test label accepted by QZ Tray spooler`, { printerName });

    return { success: true, message: `${language.toUpperCase()} test label sent — check if printer produced output` };

  } catch (err) {
    try {
      const availablePrinters = await qz.printers.find();
      await remoteLog('error', `${language.toUpperCase()} test print failed`, { printerName, error: err.message, availablePrinters });
    } catch (_) {
      await remoteLog('error', `${language.toUpperCase()} test print failed`, { printerName, error: err.message });
    }
    throw err;
  } finally {
    await disconnectQZTray();
  }
};
