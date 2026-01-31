/**
 * ESC/POS Command Generator for Thermal LR Printing
 * Generates raw ESC/POS commands for TVS RP 3230 ABW thermal printer
 */

import { dateFormatter } from "./dateFormatter";
import { fromDbValueNum } from "./currencyUtils";

// ESC/POS Commands
const ESC = '\x1B';
const GS = '\x1D';
const LF = '\n';

/**
 * Display value as number or blank
 */
const displayValueNum = (dbValue) => {
  const value = fromDbValueNum(dbValue); // Returns number, not string
  return typeof value === 'number' && !isNaN(value) ? value : 0;
};

/**
 * Display value as currency or blank
 */
const displayOrBlank = (dbValue) => {
  if (dbValue === null || dbValue === undefined || dbValue === 0) {
    return '____';
  }
  const num = displayValueNum(dbValue);
  return num === 0 ? '____' : `Rs.${num.toFixed(2)}`;
};

/**
 * Generate ESC/POS receipt for a single copy
 * @param {Object} parcel - Parcel data from backend
 * @param {number} auto - 0 for normal copy, 1 for auto copy (hides amounts for To Pay)
 * @returns {string} ESC/POS command string
 */
export const generateESCPOSReceipt = (parcel, auto = 0) => {
  let receipt = '';

  // Initialize printer
  receipt += ESC + '@'; // Initialize
  receipt += ESC + 'a' + '\x00'; // Left align
  receipt+= ESC + 'M' + '\x01';

  // Date (small font)
  receipt += ESC + '!' + '\x00'; // Normal font
  receipt += `Date: ${dateFormatter(parcel.placedAt)}`;
  receipt += `Created By: ${parcel.addedBy?.name || "____"}${LF}`;

  // Company name (bold, large)
  receipt+= ESC + 'a' + '\x01'; 
  receipt += ESC + '!' + '\x31'; // Double height + bold
  receipt += 'FRIENDS TRANSPORT CO.' + LF;
  receipt += ESC + '!' + '\x00';

  //lr  no
  receipt+= ESC + '!' + '\x11';
  receipt += `LR No: ${parcel.trackingId}${LF}`;
  receipt += ESC + '!' + '\x00'; // Reset to normal
   

  // Phone numbers
  receipt += `${parcel.sourceWarehouse.warehouseID} Ph.: ${parcel.sourceWarehouse.phoneNo || "____"}`;
  receipt += `${parcel.destinationWarehouse.warehouseID} Ph.: ${parcel.destinationWarehouse.phoneNo || "____"}${LF}`;

  // Website
  receipt += ESC + '!' + '\x10'; // Bold
  receipt += 'Track your order at: www.friendstransport.in' + LF;
  receipt += ESC + '!' + '\x00'; // Reset

  receipt+= ESC + 'a' + '\x00';

  receipt+='\n';

  // Route bar
  receipt += ESC + 'a' + '\x00'; // Left align
  receipt += ESC + '!' + '\x10'; // Bold
  receipt += 'From: ';
  receipt += ESC + '!' + '\x00';
  receipt += `${parcel.sourceWarehouse.name}${LF}`;
  receipt += ESC + '!' + '\x10'; // Bold
  receipt += 'To: ';
  receipt += ESC + '!' + '\x00';
  receipt += `${parcel.destinationWarehouse.name}${LF}`;
  receipt += ESC + '!' + '\x00'; // Reset
  receipt += LF;

  // Party section
  receipt += ESC + '!' + '\x10'; // Bold
  receipt += `Consignor: ${parcel.sender.name}${LF}`;
  receipt += `Ph: ${parcel.sender.phoneNo || "NA"}${LF}`;
  receipt+='\n';
  receipt += `Consignee: ${parcel.receiver.name}${LF}`;
  receipt += `Ph: ${parcel.receiver.phoneNo || "NA"}${LF}`;
  receipt += ESC + '!' + '\x00'; // Reset
  receipt += LF;

  // Items table header
  receipt += '- - - - - - - - - - - - - - - - - - -' + LF;
  if (auto === 1 && parcel.payment === 'To Pay') {
    receipt += 'No.     Item                     Qty' + LF;
  } else {
    receipt += 'No.  Item             Qty     Amount' + LF;
  }
  receipt += '- - - - - - - - - - - - - - - - - - -' + LF;

  // Items
  let index = 1;
  let totalQty = 0;
  for (const item of parcel.items) {
    totalQty += item.quantity;
    const itemLine = `${index}. ${item.name} (${item.itemType.name})`;
    
    if (auto === 1 && parcel.payment === 'To Pay') {
      // 3 column layout
      receipt += `${itemLine.padEnd(20, ' ')} ${item.quantity}${LF}`;
    } else {
      // 4 column layout with amount
      const itemFreight = displayValueNum(item.freight) || 0;
      const itemHamali = displayValueNum(item.hamali) || 0;
      const itemRate = itemFreight + itemHamali + itemHamali;
      const itemAmount = itemRate * item.quantity;
      const amountStr = itemAmount === 0 ? '____' : `Rs.${Number(itemAmount).toFixed(2)}`;
      receipt += `${itemLine.padEnd(15, ' ')} ${item.quantity.toString().padStart(3, ' ')} ${amountStr.padStart(8, ' ')}${LF}`;
    }
    index++;
  }

  // Total row
  receipt += '- - - - - - - - - - - - - - - - - - -' + LF;

  const totalFreight = displayValueNum(parcel.freight) || 0;
  const totalHamali = displayValueNum(parcel.hamali) || 0;
  const totalAmount = totalFreight + 2 * totalHamali;
  const displayTotal = totalAmount === 0 ? '____' : `Rs.${Number(totalAmount).toFixed(2)}`;
  
  receipt += ESC + '!' + '\x10'; // Bold
  if (auto === 1 && parcel.payment === 'To Pay') {
    receipt += `Total:              ${totalQty}${LF}`;
  } else {
    receipt += `Total:         ${totalQty}     ${displayTotal}${LF}`;
  }
  receipt += ESC + '!' + '\x00'; // Reset
  receipt += '--------------------------------' + LF;
  receipt += LF;

  // Footer info
  const doorDelivery = parcel.isDoorDelivery 
    ? (auto ? 'Yes' : displayOrBlank(parcel.doorDeliveryCharge))
    : 'No';

  receipt += ESC + 'a' + '\x00';
  
  if (!(auto === 1 && parcel.payment === 'To Pay')) {
    // Show both Door Delivery and Total on same line
    receipt += `Door Delivery: ${doorDelivery.padEnd(6, ' ')}`;
    receipt += ESC + '!' + '\x10'; // Bold
    receipt += `Payment: ${parcel.payment.toUpperCase()}`;
    receipt += ESC + '!' + '\x00'; // Reset
    receipt += LF;
  } else {
    // For auto copy with To Pay, only show Door Delivery
    receipt += `Door Delivery: ${doorDelivery}${LF}`;
  }
  receipt += LF;

  receipt += ESC + 'a' + '\x01';
  receipt += 'GST: 36AAFFF2744R1ZX' + LF;
  receipt += 'SUBJECT TO HYDERABAD JURISDICTION' + LF;
  receipt += ESC + 'a' + '\x00';

  // Feed lines before cut (ensures content is past cutter)
  receipt += '\n\n';

  // Cut paper - using partial cut for better compatibility
  receipt += GS + 'V' + 'A' + '\x00'; // Partial cut (GS V A 0)

  return receipt;
};

/**
 * Generate 3 copies of the receipt (2 normal + 1 auto)
 * @param {Object} parcel - Parcel data from backend
 * @returns {string} ESC/POS command string for all 3 copies
 */
export const generateThreeCopies = (parcel) => {
  let receipt = '';

  // Copy 1 (normal)
  receipt += generateESCPOSReceipt(parcel, 0);

  // Copy 2 (normal)
  receipt += generateESCPOSReceipt(parcel, 0);

  // Copy 3 (auto - for To Pay parcels)
  receipt += generateESCPOSReceipt(parcel, 1);

  return receipt;
};

/**
 * Generate individual copies as array (for QZ Tray)
 * @param {Object} parcel - Parcel data from backend
 * @returns {Array<string>} Array of ESC/POS command strings
 */
export const generateCopiesArray = (parcel) => {
  return [
    generateESCPOSReceipt(parcel, 0), // Copy 1
    generateESCPOSReceipt(parcel, 0), // Copy 2
    generateESCPOSReceipt(parcel, 1), // Copy 3 (auto)
  ];
};
