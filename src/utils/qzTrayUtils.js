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
MIID3TCCAsUCFCP8lenlp0cz/cLplvqn7xPhuJVTMA0GCSqGSIb3DQEBCwUAMIGq
MQswCQYDVQQGEwJJTjESMBAGA1UECAwJVGVsYW5nYW5hMRIwEAYDVQQHDAlIeWRl
cmFiYWQxHjAcBgNVBAoMFUZyaWVuZHMgVHJhbnNwb3J0IENvLjEdMBsGA1UEAwwU
ZnRjZmxlZXQubmV0bGlmeS5hcHAxNDAyBgkqhkiG9w0BCQEWJWZyaWVuZHN0cmFu
c3BvcnRjb3Jwb3JhdGlvbkBnbWFpbC5jb20wHhcNMjYwMjI3MTQwMjM4WhcNMzYw
MjI1MTQwMjM4WjCBqjELMAkGA1UEBhMCSU4xEjAQBgNVBAgMCVRlbGFuZ2FuYTES
MBAGA1UEBwwJSHlkZXJhYmFkMR4wHAYDVQQKDBVGcmllbmRzIFRyYW5zcG9ydCBD
by4xHTAbBgNVBAMMFGZ0Y2ZsZWV0Lm5ldGxpZnkuYXBwMTQwMgYJKoZIhvcNAQkB
FiVmcmllbmRzdHJhbnNwb3J0Y29ycG9yYXRpb25AZ21haWwuY29tMIIBIjANBgkq
hkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtB/MJUwRMsTVoc8HSA7YBSETcbLhtdx4
Nllqe1QPBpyg0hW6VXsjiYF99MeO6k1l8YcpKeBXn5sIJHAZD6V1FSd3QMcGebfN
89IjE79Id3WUvRuzrMFx0uG1WRcSQg5uXiA5TkO/lGmZs3ktoTeFIOlx1xah4+bA
mAMZzWeuThM704cxOAFnk2nEH84rbNqiRAbzd4D+F7NxhnYJA+1PflduBpD0OaUq
j3i34Xhoj8aGxSa0nCt8ehUt5iTcqZ15zb3gVnrM6bpgZY0Yp845JukeuhBPAisI
by2nbIoseK6xFcQJIkaCD5qcP76f1sfPJAo79p7W5PuVKWc+C+SOoQIDAQABMA0G
CSqGSIb3DQEBCwUAA4IBAQA1qBcwQNsKZvnlkMllZ+oqCCEnJSsbUtx8068oSlPy
UTVoAlSS5MhRUfaGFiL3FcljIOnV9NGsEBt/qfv5GFRORtgse//PbW0qol39c+VA
RdlXUiScyCPFr7ukMxgAUwRHS1C5ZqljaJHhGzq57vEvEHRZHhhbKjGkrqwZDT0A
QnDflUApOzosSrnaaQ9J8qvyyQTkS+BbzttiiIOIifzYARuWjraNfuAB5Yj4X9VZ
CgzUhwWaIqmWy5bGbrOVppFlHeED6xCOywUZU5N+ytVC5QMCjqcpgSbbnm5I9DhA
LFCtfvRCUo4lYX7Lu8ESbJ+5KgXtnjVhdbS9M2QZ9PUj
-----END CERTIFICATE-----`;

const QZ_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQC0H8wlTBEyxNWh
zwdIDtgFIRNxsuG13Hg2WWp7VA8GnKDSFbpVeyOJgX30x47qTWXxhykp4Fefmwgk
cBkPpXUVJ3dAxwZ5t83z0iMTv0h3dZS9G7OswXHS4bVZFxJCDm5eIDlOQ7+UaZmz
eS2hN4Ug6XHXFqHj5sCYAxnNZ65OEzvThzE4AWeTacQfzits2qJEBvN3gP4Xs3GG
dgkD7U9+V24GkPQ5pSqPeLfheGiPxobFJrScK3x6FS3mJNypnXnNveBWeszpumBl
jRinzjkm6R66EE8CKwhvLadsiix4rrEVxAkiRoIPmpw/vp/Wx88kCjv2ntbk+5Up
Zz4L5I6hAgMBAAECgf8tFaEDZhpxwg3eN0JMi+DBGSPYeQFoSJ9YDuIOSzcBcKj3
ndsZikKpnnEP06gs/TJzVZxuLaVK15bPr2aWcEm2n1GcgqqSakfTv3Zqok7P5oqi
8jhpQFDast8T0AFLwnhTtIIF7Yy3hWhCDbA2vcKBBDwrhldN20yoSag/XwLzJPuf
Pzzjgm2uQqO/Ac1ngzi39C9FQSpSrzC+wjho+lETgFMrSxxBh6gixl/N982e55vM
d2DvqbATKuJ/YB1D/WYN1rECqpe9pAQLMfDHUrSHGc49ZdIaYB4qALLetJ0rQwaB
/HKS+YL+Mz5XeggcQlYqFM/mBVk4scGZph6CH2UCgYEA2r6Nl9OqlJjpBI0CJ+BO
MJtwgHlq0z7LClbxzyn7/XnxWqfmwRLHK9uwJ/9yyVu0j3UoDJ02sZ+gciQ0um6J
Iaw0eNBt3YDS1hSsKepT+f4aRj8LF7SLWFNGLW+KU0j1Q3BRid6W+H/eA2FAZwAo
a9pgDcIA/mA9aEFEw5fXEosCgYEA0s1fRKSoOhgFJ2xBrbLvXCT3pH9AX4z8LAAV
ukC4BUczTTvtAGZiL12LhKfMzC3cf2mCtg+xdFBucOEq2K2aJFNMCNtJOCe9y3/6
gNLb4vGme9g/rDyNScQkkT0mygOoq7lgiym4aglbxH7N3Q/aJQ2amdlk7RAYng3a
dOh75QMCgYEAixs1FkFwMDGRtegqX8uATd77y2frbE15d6jU++Z6Lrb2qq0tzMix
So3Z14XWrICaMcTSZDsyRgD6Wrv1oD2dDYHimJYL2BoNekEJP1qabteOQ+/hkQCq
wM+sSEavk8lI18s8v02DeqJuQH3/I8Fw8y2begRO93Wid4NSRIRyLIMCgYAUo/lN
DlZOgeWXS5lOubOIMTJyT+dss7BJWqTF/OpH0gXq7RAyttOsUZuEnK2H3IG3lAwx
aW31tp5pvRJl7vGl1uYeA+Kydem2kExl6r+PBBxKCg2J/s/SxjrSYct3gk40qk0S
sz4UW+A5aDUeDRxN/nwBznB8adQPPcoDInRnIwKBgD2y5Exuce8PmLTegGwdPmqX
FjKJnTr/ncDPHrXuw1pUGQYZG8rX9DfI3/mGrNeW2Bg2Ad+C2+pEoPh/B7ZfPHfU
+Fq7VwqS4Hd3xsvjZkLQ5pwiGAKwqdAbKSAKYodpd7HGNxXBpCES/T7I4rohrfgn
s49Ypat01YX+zXoClFLu
-----END PRIVATE KEY-----`;

// Set to true once you've added your certificate
const USE_CERTIFICATE = true;

/**
 * Configure QZ Tray security with certificate
 */
const configureQZSecurity = () => {
  if (!USE_CERTIFICATE || !window.qz) return;
  
  try {
    // Set certificate and private key for signing
    qz.security.setCertificatePromise((resolve) => {
      resolve(QZ_CERTIFICATE);
    });
    
    qz.security.setSignaturePromise((toSign) => {
      return (resolve, reject) => {
        try {
          // Use jsrsasign library (included in QZ Tray) to sign
          const privateKey = KEYUTIL.getKey(QZ_PRIVATE_KEY);
          const signature = new KJUR.crypto.Signature({ alg: "SHA512withRSA" });
          signature.init(privateKey);
          signature.updateString(toSign);
          const signedData = signature.sign();
          resolve(stob64(signedData));
        } catch (err) {
          reject(err);
        }
      };
    });
  } catch (error) {
    console.error("Failed to configure QZ Tray security:", error);
  }
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
  
  // Configure security before connecting
  configureQZSecurity();
  
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
