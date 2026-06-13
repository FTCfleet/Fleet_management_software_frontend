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
/* Label Generators                                                    */
/* 'tspl' — TSC Printer Script Language                               */
/* 'bplz' — SNBC ZPL-compatible dialect                               */
/* 'gdi'  — Windows GDI via pixel/html (bypasses raw languages)       */
/* ------------------------------------------------------------------ */

// Stored in localStorage as 'barcodePrinterLanguage': 'tspl'|'bplz'|'gdi'
// If raw commands (TSPL/BPLZ) don't print, use 'gdi' — it renders through
// the Windows driver and works regardless of the printer's command language.

const generateTSPLBarcode = (trackingId, count) => [
  'SIZE 100 mm,25 mm',
  'GAP 3 mm,0 mm',
  'DENSITY 8',
  'DIRECTION 0',
  'CLS',
  `BARCODE 10,5,"CODE128",120,0,0,4,4,"${trackingId}"`,
  `TEXT 10,135,"3",0,1,1,"${trackingId}"`,
  `PRINT ${count},1`,
  'END',
].join('\r\n') + '\r\n';

const generateBPLZBarcode = (trackingId, count) => {
  let cmd = '';
  for (let i = 0; i < count; i++) {
    cmd += '^XA\r\n';
    cmd += '^PW800\r\n';
    cmd += '^LL200\r\n';
    cmd += '^BY4,3,120\r\n';
    cmd += `^FO10,5^BCN,120,N,N^FD${trackingId}^FS\r\n`;
    cmd += `^FO0,140^FB800,1,,C^A0N,30,30^FD${trackingId}^FS\r\n`;
    cmd += '^XZ\r\n';
  }
  return cmd;
};

// GDI HTML is rendered by the Windows driver — works on any label printer
// that has a proper Windows driver installed, regardless of command language.
const generateGDIBarcode = (trackingId, count) => {
  const labelHTML = `<!DOCTYPE html><html><body style="margin:0;padding:1mm 5mm;font-family:Arial,sans-serif;text-align:center;width:90mm;box-sizing:border-box;">
<svg xmlns="http://www.w3.org/2000/svg" width="90mm" height="14mm" viewBox="0 0 340 53">
  <rect width="340" height="53" fill="white"/>
  <text x="170" y="48" font-size="10" text-anchor="middle" font-family="monospace">${trackingId}</text>
</svg>
<p style="font-size:13px;font-weight:bold;margin:1mm 0 0;letter-spacing:1px;">${trackingId}</p>
</body></html>`;
  return labelHTML;
};

const buildLabelData = (trackingId, count, language) => {
  if (language === 'bplz') return generateBPLZBarcode(trackingId, count);
  if (language === 'gdi')  return generateGDIBarcode(trackingId, count);
  return generateTSPLBarcode(trackingId, count);
};


const buildPrintJob = (data, language, count) => {
  if (language === 'gdi') {
    // 100mm × 25mm in inches
    return [{ type: 'pixel', format: 'html', flavor: 'plain', options: { pageWidth: 3.94, pageHeight: 0.98, units: 'in' }, data }];
  }
  return [{ type: 'raw', format: 'plain', data }];
};

/* ------------------------------------------------------------------ */

/**
 * Print barcode labels via QZ Tray.
 * Set localStorage key 'barcodePrinterLanguage' to 'tspl', 'bplz', or 'gdi'.
 * Default is 'bplz'. Use 'gdi' if raw commands produce no output.
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
    const config = qz.configs.create(printerName, language === 'gdi' ? { copies: count } : {});
    const labelData = buildLabelData(trackingId, count, language);
    const printJob = buildPrintJob(labelData, language, count);

    await remoteLog('info', 'Sending label to barcode printer', { trackingId, printerName, count, language, byteCount: labelData.length });
    await qz.print(config, printJob);
    await remoteLog('info', 'Barcode label print accepted by spooler', { trackingId, printerName, count, language });

    return { success: true, message: `Successfully printed ${count} barcode label(s) via ${language.toUpperCase()}` };

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

