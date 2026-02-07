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
        throw new Error('Web Bluetooth is not supported on this device/browser. Use Chrome or Edge on Android.');
      }

      console.log('Requesting Bluetooth device...');

      // Request device with broader filters
      // Most thermal printers use Serial Port Profile (SPP)
      this.device = await navigator.bluetooth.requestDevice({
        // Accept all devices to see what's available
        acceptAllDevices: true,
        optionalServices: [
          PRINTER_SERVICE_UUID,
          '0000ff00-0000-1000-8000-00805f9b34fb', // Common SPP service
          '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Another common service
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Nordic UART Service
        ]
      });

      if (!this.device) {
        throw new Error('No device selected');
      }

      console.log('Device selected:', this.device.name, 'ID:', this.device.id);

      // Connect to GATT server
      console.log('Connecting to GATT server...');
      const server = await this.device.gatt.connect();
      console.log('Connected to GATT server');
      
      // Try to find a suitable service
      console.log('Getting services...');
      const services = await server.getPrimaryServices();
      console.log('Available services:', services.length, services.map(s => s.uuid));

      if (services.length === 0) {
        throw new Error('No services found on device. This device may not support Bluetooth printing.');
      }

      let service = null;
      let characteristic = null;

      // Try common printer service first
      try {
        service = await server.getPrimaryService(PRINTER_SERVICE_UUID);
        console.log('Found printer service:', PRINTER_SERVICE_UUID);
      } catch (e) {
        console.log('Standard printer service not found, trying alternatives...');
        
        // Try alternative services
        const alternativeServices = [
          '0000ff00-0000-1000-8000-00805f9b34fb',
          '49535343-fe7d-4ae5-8fa9-9fafd205e455',
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
        ];

        for (const uuid of alternativeServices) {
          try {
            service = await server.getPrimaryService(uuid);
            console.log('Found alternative service:', uuid);
            break;
          } catch (err) {
            console.log('Service', uuid, 'not found');
            continue;
          }
        }

        // If no known service, use first available service
        if (!service && services.length > 0) {
          service = services[0];
          console.log('Using first available service:', service.uuid);
        }
      }

      if (!service) {
        throw new Error('No suitable service found. Device may not be a printer or not compatible.');
      }

      // Get characteristics
      console.log('Getting characteristics...');
      const characteristics = await service.getCharacteristics();
      console.log('Available characteristics:', characteristics.length, characteristics.map(c => ({
        uuid: c.uuid,
        properties: c.properties
      })));

      if (characteristics.length === 0) {
        throw new Error('No characteristics found on service');
      }

      // Try to find writable characteristic
      try {
        characteristic = await service.getCharacteristic(PRINTER_CHARACTERISTIC_UUID);
        console.log('Found printer characteristic:', PRINTER_CHARACTERISTIC_UUID);
      } catch (e) {
        console.log('Standard characteristic not found, looking for writable characteristic...');
        
        // Find any writable characteristic
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            characteristic = char;
            console.log('Found writable characteristic:', char.uuid, 'Properties:', char.properties);
            break;
          }
        }
      }

      if (!characteristic) {
        throw new Error('No writable characteristic found. Device may not support data transmission.');
      }

      this.characteristic = characteristic;
      this.isConnected = true;

      // Save device ID for auto-reconnect
      localStorage.setItem('bluetoothPrinterId', this.device.id);
      localStorage.setItem('bluetoothPrinterName', this.device.name);
      localStorage.setItem('bluetoothPrinterServiceUUID', service.uuid);
      localStorage.setItem('bluetoothPrinterCharUUID', characteristic.uuid);

      console.log('✓ Successfully connected to printer');

      // Listen for disconnection
      this.device.addEventListener('gattserverdisconnected', () => {
        this.isConnected = false;
        console.log('Printer disconnected');
      });

      return {
        success: true,
        deviceName: this.device.name,
        deviceId: this.device.id,
        serviceUUID: service.uuid,
        characteristicUUID: characteristic.uuid
      };

    } catch (error) {
      console.error('Bluetooth connection error:', error);
      
      // Provide user-friendly error messages
      let userMessage = error.message;
      
      if (error.message.includes('User cancelled')) {
        userMessage = 'Connection cancelled. Please try again and select your printer.';
      } else if (error.message.includes('not found')) {
        userMessage = 'Device not found or not compatible. Make sure your printer is on and in pairing mode.';
      } else if (error.message.includes('GATT')) {
        userMessage = 'Failed to connect to device. Make sure Bluetooth is enabled and printer is nearby.';
      }
      
      return {
        success: false,
        error: userMessage
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
      const savedServiceUUID = localStorage.getItem('bluetoothPrinterServiceUUID');
      const savedCharUUID = localStorage.getItem('bluetoothPrinterCharUUID');
      
      if (!savedDeviceId) {
        return { success: false, error: 'No saved device found' };
      }

      console.log('Attempting to reconnect to saved device:', savedDeviceId);

      // Get previously paired devices
      const devices = await navigator.bluetooth.getDevices();
      const savedDevice = devices.find(d => d.id === savedDeviceId);

      if (!savedDevice) {
        return { success: false, error: 'Saved device not found. Please pair again.' };
      }

      this.device = savedDevice;

      // Connect to GATT server
      const server = await this.device.gatt.connect();
      console.log('Reconnected to GATT server');
      
      // Get service (use saved UUID if available)
      const serviceUUID = savedServiceUUID || PRINTER_SERVICE_UUID;
      const service = await server.getPrimaryService(serviceUUID);
      console.log('Got service:', serviceUUID);
      
      // Get characteristic (use saved UUID if available)
      const charUUID = savedCharUUID || PRINTER_CHARACTERISTIC_UUID;
      this.characteristic = await service.getCharacteristic(charUUID);
      console.log('Got characteristic:', charUUID);
      
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

      // Convert ESC/POS string to Uint8Array properly
      // ESC/POS uses raw bytes, not UTF-8 encoding
      const data = new Uint8Array(escPosCommands.length);
      for (let i = 0; i < escPosCommands.length; i++) {
        data[i] = escPosCommands.charCodeAt(i) & 0xFF;
      }

      // Use smaller chunk size for better compatibility
      // Some printers have MTU of 20-23 bytes
      const chunkSize = 40;
      
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        
        try {
          await this.characteristic.writeValue(chunk);
        } catch (writeError) {
          console.error('Failed to send data chunk:', writeError);
          throw new Error(`Failed to send data: ${writeError.message}`);
        }
        
        // Longer delay between chunks for printer to process
        await new Promise(resolve => setTimeout(resolve, 100));
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
