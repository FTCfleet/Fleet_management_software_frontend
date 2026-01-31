/**
 * QZ Tray Testing Utilities
 * Use these functions in browser console to test QZ Tray setup
 */

/**
 * Test if QZ Tray is available and running
 * Usage: testQZTray()
 */
export const testQZTray = async () => {
  console.log("🔍 Testing QZ Tray...");
  
  // Check if QZ Tray script is loaded
  if (typeof qz === 'undefined') {
    console.error("❌ QZ Tray script not loaded");
    console.log("Solution: Make sure QZ Tray script is in index.html");
    return false;
  }
  console.log("✅ QZ Tray script loaded");
  
  // Try to connect
  try {
    await qz.websocket.connect();
    console.log("✅ Connected to QZ Tray");
    
    // Get version
    const version = qz.websocket.getVersion();
    console.log(`📦 QZ Tray version: ${version}`);
    
    await qz.websocket.disconnect();
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to QZ Tray");
    console.error("Error:", error.message);
    console.log("Solution: Make sure QZ Tray application is running");
    return false;
  }
};

/**
 * List all available printers
 * Usage: listPrinters()
 */
export const listPrinters = async () => {
  console.log("🖨️  Finding printers...");
  
  try {
    await qz.websocket.connect();
    const printers = await qz.printers.find();
    
    console.log(`\n✅ Found ${printers.length} printer(s):\n`);
    printers.forEach((printer, index) => {
      console.log(`${index + 1}. "${printer}"`);
    });
    
    console.log("\n💡 Copy the exact printer name (including quotes) to use in your code");
    console.log('Example: export const DEFAULT_THERMAL_PRINTER = "TVS RP 3230 ABW";');
    
    await qz.websocket.disconnect();
    return printers;
  } catch (error) {
    console.error("❌ Failed to list printers");
    console.error("Error:", error.message);
    return [];
  }
};

/**
 * Find TVS printer automatically
 * Usage: findTVSPrinter()
 */
export const findTVSPrinter = async () => {
  console.log("🔍 Searching for TVS printer...");
  
  try {
    await qz.websocket.connect();
    const printers = await qz.printers.find();
    
    const tvsPrinters = printers.filter(printer => 
      printer.toLowerCase().includes('tvs')
    );
    
    if (tvsPrinters.length === 0) {
      console.log("❌ No TVS printer found");
      console.log("Available printers:");
      printers.forEach(p => console.log(`  - ${p}`));
    } else {
      console.log(`✅ Found ${tvsPrinters.length} TVS printer(s):`);
      tvsPrinters.forEach((printer, index) => {
        console.log(`${index + 1}. "${printer}"`);
      });
      console.log("\n💡 Use this exact name in your code:");
      console.log(`export const DEFAULT_THERMAL_PRINTER = "${tvsPrinters[0]}";`);
    }
    
    await qz.websocket.disconnect();
    return tvsPrinters;
  } catch (error) {
    console.error("❌ Failed to search for TVS printer");
    console.error("Error:", error.message);
    return [];
  }
};

/**
 * Test print to specific printer
 * Usage: testPrint("TVS RP 3230 ABW")
 */
export const testPrint = async (printerName) => {
  console.log(`🖨️  Testing print to: ${printerName}`);
  
  try {
    await qz.websocket.connect();
    
    const config = qz.configs.create(printerName);
    const data = [{
      type: 'html',
      format: 'plain',
      data: '<html><body><h1>QZ Tray Test Print</h1><p>If you see this, printing works!</p></body></html>'
    }];
    
    await qz.print(config, data);
    console.log("✅ Test print sent successfully");
    
    await qz.websocket.disconnect();
    return true;
  } catch (error) {
    console.error("❌ Test print failed");
    console.error("Error:", error.message);
    
    if (error.message.includes("Printer not found")) {
      console.log("\n💡 Printer name doesn't match. Run listPrinters() to see available printers");
    }
    
    return false;
  }
};

/**
 * Complete diagnostic test
 * Usage: runDiagnostics()
 */
export const runDiagnostics = async () => {
  console.log("🏥 Running QZ Tray Diagnostics...\n");
  
  // Test 1: QZ Tray availability
  console.log("Test 1: QZ Tray Availability");
  const qzAvailable = await testQZTray();
  console.log("");
  
  if (!qzAvailable) {
    console.log("❌ Diagnostics stopped - QZ Tray not available");
    return;
  }
  
  // Test 2: List printers
  console.log("Test 2: Available Printers");
  const printers = await listPrinters();
  console.log("");
  
  // Test 3: Find TVS printer
  console.log("Test 3: TVS Printer Detection");
  const tvsPrinters = await findTVSPrinter();
  console.log("");
  
  // Summary
  console.log("📊 Diagnostic Summary:");
  console.log(`✅ QZ Tray: ${qzAvailable ? 'Working' : 'Not Working'}`);
  console.log(`✅ Printers Found: ${printers.length}`);
  console.log(`✅ TVS Printers: ${tvsPrinters.length}`);
  
  if (tvsPrinters.length > 0) {
    console.log("\n🎉 Setup looks good! Use this printer name:");
    console.log(`export const DEFAULT_THERMAL_PRINTER = "${tvsPrinters[0]}";`);
  } else {
    console.log("\n⚠️  No TVS printer found. Please check:");
    console.log("1. Printer is connected and turned on");
    console.log("2. Printer drivers are installed");
    console.log("3. Printer appears in system settings");
  }
};

/**
 * Change thermal printer name
 * Usage: changePrinterName('TVS-E RP 3230')
 */
const changePrinterName = (name) => {
  if (!name || typeof name !== 'string') {
    console.error('❌ Please provide a valid printer name');
    console.log('Usage: changePrinterName("TVS-E RP 3230")');
    return;
  }
  
  localStorage.setItem('thermalPrinterName', name);
  console.log(`✅ Printer name changed to: ${name}`);
  console.log('This will be used for all thermal printing');
};

// Make functions available in browser console
if (typeof window !== 'undefined') {
  window.changePrinterName = changePrinterName;
  
  console.log("🔧 Thermal printer utility loaded. Use: changePrinterName('printer name')");
}
