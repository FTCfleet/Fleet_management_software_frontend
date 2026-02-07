/**
 * Web Bluetooth Printing Utility for Mobile/Tablet
 * Works on Android Chrome, Edge, Opera
 * Requires HTTPS and user interaction
 */

const PRINTER_SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb'; // Common ESC/POS service
const PRINTER_CHARACTERISTIC_UUID = '00002af1-0000-1000-8000-00805f9b34fb'; // Write characteristic

class WebBluetoothPrinter {
  constructor() {
    this.device = null;
    this.characteristic = null;
    this.isConnected = false;
  }

  /**
   * Check if Web Bluetooth is supported
   */
  isSupported() {
    return 'bluetooth' in navigator;
  }

  /**
   * Request and connect to a Bluetooth printer
   * Requires user interaction (button click)
   */
  async connect() {
    try {
      if (!this.isSupported()) {
        throw new Error('Web Bluetooth is not supported on this device/browser');
      }

      // Request device
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [PRINTER_SERVICE_UUID] },
          { namePrefix: 'RP' }, // Common thermal printer prefix
          { namePrefix: 'Printer' },
        ],
        optionalServices: [PRINTER_SERVICE_UUID]
      });

      // Connect to GATT server
      const server = await this.device.gatt.connect();
      
      // Get service
      const service = await server.getPrimaryService(PRINTER_SERVICE_UUID);
      
      // Get characteristic
      this.characteristic = await service.getCharacteristic(PRINTER_CHARACTERISTIC_UUID);
      
      this.isConnected = true;

      // Save device ID for auto-reconnect
      localStorage.setItem('bluetoothPrinterId', this.device.id);
      localStorage.setItem('bluetoothPrinterName', this.device.name);

      // Listen for disconnection
      this.device.addEventListener('gattserverdisconnected', () => {
        this.isConnected = false;
        console.log('Printer disconnected');
      });

      return {
        success: true,
        deviceName: this.device.name,
        deviceId: this.device.id
      };

    } catch (error) {
      console.error('Bluetooth connection error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Try to reconnect to previously paired device
   */
  async reconnect() {
    try {
      if (!this.isSupported()) {
        return { success: false, error: 'Web Bluetooth not supported' };
      }

      const savedDeviceId = localStorage.getItem('bluetoothPrinterId');
      if (!savedDeviceId) {
        return { success: false, error: 'No saved device found' };
      }

      // Get previously paired devices
      const devices = await navigator.bluetooth.getDevices();
      const savedDevice = devices.find(d => d.id === savedDeviceId);

      if (!savedDevice) {
        return { success: false, error: 'Saved device not found. Please pair again.' };
      }

      this.device = savedDevice;

      // Connect to GATT server
      const server = await this.device.gatt.connect();
      
      // Get service
      const service = await server.getPrimaryService(PRINTER_SERVICE_UUID);
      
      // Get characteristic
      this.characteristic = await service.getCharacteristic(PRINTER_CHARACTERISTIC_UUID);
      
      this.isConnected = true;

      return {
        success: true,
        deviceName: this.device.name,
        deviceId: this.device.id
      };

    } catch (error) {
      console.error('Bluetooth reconnection error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Disconnect from printer
   */
  async disconnect() {
    try {
      if (this.device && this.device.gatt.connected) {
        await this.device.gatt.disconnect();
      }
      this.isConnected = false;
      this.device = null;
      this.characteristic = null;
      return { success: true };
    } catch (error) {
      console.error('Disconnect error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Forget saved printer
   */
  forgetDevice() {
    localStorage.removeItem('bluetoothPrinterId');
    localStorage.removeItem('bluetoothPrinterName');
    this.disconnect();
  }

  /**
   * Get saved printer info
   */
  getSavedPrinter() {
    const id = localStorage.getItem('bluetoothPrinterId');
    const name = localStorage.getItem('bluetoothPrinterName');
    return id ? { id, name } : null;
  }

  /**
   * Print ESC/POS commands
   */
  async print(escPosCommands) {
    try {
      if (!this.isConnected || !this.characteristic) {
        // Try to reconnect
        const reconnectResult = await this.reconnect();
        if (!reconnectResult.success) {
          throw new Error('Printer not connected. Please connect first.');
        }
      }

      // Convert ESC/POS string to Uint8Array
      const encoder = new TextEncoder();
      const data = encoder.encode(escPosCommands);

      // Split into chunks (Bluetooth has MTU limit, typically 20-512 bytes)
      const chunkSize = 512;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await this.characteristic.writeValue(chunk);
        // Small delay between chunks
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      return { success: true, message: 'Print job sent successfully' };

    } catch (error) {
      console.error('Print error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      deviceName: this.device?.name || null,
      deviceId: this.device?.id || null,
      savedPrinter: this.getSavedPrinter()
    };
  }
}

// Export singleton instance
export const webBluetoothPrinter = new WebBluetoothPrinter();

/**
 * Print thermal receipt via Web Bluetooth
 */
export const printViaWebBluetooth = async (escPosCommands) => {
  return await webBluetoothPrinter.print(escPosCommands);
};

/**
 * Connect to Bluetooth printer
 */
export const connectBluetoothPrinter = async () => {
  return await webBluetoothPrinter.connect();
};

/**
 * Reconnect to saved printer
 */
export const reconnectBluetoothPrinter = async () => {
  return await webBluetoothPrinter.reconnect();
};

/**
 * Disconnect from printer
 */
export const disconnectBluetoothPrinter = async () => {
  return await webBluetoothPrinter.disconnect();
};

/**
 * Check if Web Bluetooth is supported
 */
export const isWebBluetoothSupported = () => {
  return webBluetoothPrinter.isSupported();
};
