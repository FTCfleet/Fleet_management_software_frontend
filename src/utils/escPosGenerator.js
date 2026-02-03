/**
 * ESC/POS Command Generator for Thermal LR Printing
 * TVS RP 3230 ABW – 80mm
 */

import { dateFormatter } from "./dateFormatter";
import { fromDbValueNum } from "./currencyUtils";

/* -------------------------------------------------- */
/* ESC/POS BASICS                                     */
/* -------------------------------------------------- */

const ESC = '\x1B';
const GS  = '\x1D';
const LF  = '\n';

const INIT      = ESC + '@';
const ALIGN_L   = ESC + 'a' + '\x00';
const ALIGN_C   = ESC + 'a' + '\x01';

const BOLD_ON   = ESC + 'E' + '\x01';
const BOLD_OFF  = ESC + 'E' + '\x00';

const SIZE_1X   = GS + '!' + '\x00'; // normal
const SIZE_H2   = GS + '!' + '\x01'; // tall only
const SIZE_W2   = GS + '!' + '\x10'; // wide only
const SIZE_2X   = GS + '!' + '\x11'; // big

const CUT       = GS + 'V' + 'A' + '\x00';

/* 80mm ≈ 42 chars */
const LINE = '-'.repeat(44);

/* Column widths (space added between qty & amount) */
const ITEM_W = 24;
const QTY_W  = 6;
const GAP_W  = 4;   // NEW space
const AMT_W  = 12;

/* -------------------------------------------------- */
/* HELPERS                                             */
/* -------------------------------------------------- */

const displayValueNum = (dbValue) => {
  const value = fromDbValueNum(dbValue);
  return typeof value === 'number' && !isNaN(value) ? value : 0;
};

const displayOrBlank = (dbValue) => {
  if (!dbValue) return '____';
  const num = displayValueNum(dbValue);
  return num === 0 ? '____' : `Rs.${num.toFixed(2)}`;
};

/* -------------------------------------------------- */
/* MAIN RECEIPT                                        */
/* -------------------------------------------------- */

export const generateESCPOSReceipt = (parcel, auto = 0) => {

  let receipt = '';

  receipt += INIT + ALIGN_L + SIZE_1X;

  /* ---------- Date ---------- */
  receipt += `Date: ${dateFormatter(parcel.placedAt)} `;
  receipt += `Created by: ${parcel.addedBy?.name || "____"}${LF}`;

  receipt += LF;

  /* ---------- Company ---------- */
  receipt += ALIGN_C + SIZE_2X + BOLD_ON;
  receipt += 'FRIENDS TRANSPORT CO.' + LF;
  receipt += BOLD_OFF + SIZE_1X;

  receipt += LF; // vertical space below company

  /* ---------- LR ---------- */
  receipt += SIZE_W2 + BOLD_ON;
  receipt += `LR No: ${parcel.trackingId}${LF}`;
  receipt += SIZE_1X + BOLD_OFF;

  receipt += LF;

  /* ---------- Phones (CENTERED) ---------- */
  receipt += ALIGN_C;
  receipt += `${parcel.sourceWarehouse.warehouseID} Ph.: ${parcel.sourceWarehouse.phoneNo || "____"}   `;
  receipt += `${parcel.destinationWarehouse.warehouseID} Ph.: ${parcel.destinationWarehouse.phoneNo || "____"}${LF}`;

  /* ---------- Track URL ---------- */
  receipt += BOLD_ON + 'Track your order at: www.friendstransport.in' + BOLD_OFF + LF;
  receipt += LINE + LF;

  receipt += ALIGN_L;

  /* ---------- From / To (tall + bold) ---------- */
  receipt += SIZE_H2 ;
  receipt += `From: ${parcel.sourceWarehouse.name}${LF}`;
  receipt += `To: ${parcel.destinationWarehouse.name}${LF}`;
  receipt += SIZE_1X + LF;

  /* ---------- Consignor / Consignee (tall + bold) ---------- */
  receipt += SIZE_H2;
  if(!(parcel.sender.name && parcel.sender.phoneNo)){
    receipt += 'Consignor: NA   Ph: NA';
  }else{
    receipt += `Consignor: ${parcel.sender.name}${LF}`;
    receipt += `Ph: ${parcel.sender.phoneNo || "NA"}${LF}${LF}`;
  }
  receipt += `Consignee: ${parcel.receiver.name}${LF}`;
  receipt += `Ph: ${parcel.receiver.phoneNo || "NA"}${LF}`;
  receipt += SIZE_1X + LF;

  /* ---------- Table header ---------- */
  receipt += LF;
  receipt += BOLD_ON;

  if (auto === 1 && parcel.payment === 'To Pay') {
    receipt += 'No.  Item'.padEnd(ITEM_W) +
               'Qty'.padStart(QTY_W) + LF;
  } else {
    receipt += 'No.  Item'.padEnd(ITEM_W) +
               'Qty'.padStart(QTY_W) +
               ' '.repeat(GAP_W) +
               'Amount'.padStart(AMT_W) + LF;
  }

  receipt += BOLD_OFF;
  receipt += LINE + LF;

  /* ---------- Items ---------- */

  let index = 1;
  let totalQty = 0;

  for (const item of parcel.items) {

    const qty = item.quantity || 0;
    totalQty += qty;

    const label = `${index}. ${item.name} (${item.itemType.name})`;

    // Wrap long item names to multiple lines
    const wrapText = (text, maxWidth) => {
      const lines = [];
      let currentPos = 0;
      
      while (currentPos < text.length) {
        lines.push(text.substring(currentPos, currentPos + maxWidth));
        currentPos += maxWidth;
      }
      
      return lines;
    };

    const wrappedLines = wrapText(label, ITEM_W);

    if (auto === 1 && parcel.payment === 'To Pay') {

      // First line with qty
      receipt += wrappedLines[0].padEnd(ITEM_W) +
                 qty.toString().padStart(QTY_W) + LF;
      
      // Additional lines (item name continuation) - no qty
      for (let i = 1; i < wrappedLines.length; i++) {
        receipt += wrappedLines[i].padEnd(ITEM_W) +
                   ' '.repeat(QTY_W) + LF;
      }

    } else {

      const freight = displayValueNum(item.freight);
      const hamali  = displayValueNum(item.hamali);
      const rate = freight + hamali + hamali;
      const amount = rate * qty;

      const amtStr = amount === 0 ? '____' : `Rs.${amount.toFixed(2)}`;

      // First line with qty and amount
      receipt += wrappedLines[0].padEnd(ITEM_W) +
                 qty.toString().padStart(QTY_W) +
                 ' '.repeat(GAP_W) +
                 amtStr.padStart(AMT_W) +
                 LF;
      
      // Additional lines (item name continuation) - no qty or amount
      for (let i = 1; i < wrappedLines.length; i++) {
        receipt += wrappedLines[i].padEnd(ITEM_W) +
                   ' '.repeat(QTY_W) +
                   ' '.repeat(GAP_W) +
                   ' '.repeat(AMT_W) +
                   LF;
      }
    }

    index++;
  }

  /* ---------- Totals ---------- */

  const totalFreight = displayValueNum(parcel.freight);
  const totalHamali  = displayValueNum(parcel.hamali);
  const totalAmount  = totalFreight + 2 * totalHamali;

  const amtStr = totalAmount === 0 ? '____' : `Rs.${totalAmount.toFixed(2)}`;

  receipt += LINE + LF;
  receipt += BOLD_ON;

  if (auto === 1 && parcel.payment === 'To Pay') {

    receipt += 'Total'.padEnd(ITEM_W) +
               totalQty.toString().padStart(QTY_W) + LF;

  } else {

    receipt += 'Total'.padEnd(ITEM_W) +
               totalQty.toString().padStart(QTY_W) +
               ' '.repeat(GAP_W) +
               amtStr.padStart(AMT_W) + LF;
  }

  receipt += BOLD_OFF;
  receipt += LF;

  /* ---------- Footer ---------- */

  const doorDelivery = parcel.isDoorDelivery
    ? (auto ? 'Yes' : displayOrBlank(parcel.doorDeliveryCharge))
    : 'No';

  receipt += `Door Delivery: ${doorDelivery.padEnd(6)}`;

  /* shift Payment 5 chars right */
  receipt += ' '.repeat(5) +
             BOLD_ON + `Payment: ${parcel.payment.toUpperCase()}` + BOLD_OFF + LF + LF;

  /* ---------- Footer center ---------- */
  receipt += ALIGN_C;

  /* WhatsApp logo + spaced number */
  
  receipt += 'GST: 36AAFFF2744R1ZX' + LF;
  receipt += 'SUBJECT TO HYDERABAD JURISDICTION' + LF;

  receipt += ' WhatsApp: +91 7075124426' + LF;

  receipt += CUT;

  return receipt;
};

/* -------------------------------------------------- */
/* COPIES                                              */
/* -------------------------------------------------- */

export const generateThreeCopies = (parcel) =>
  generateESCPOSReceipt(parcel, 0) +
  generateESCPOSReceipt(parcel, 0) +
  generateESCPOSReceipt(parcel, 1);

export const generateCopiesArray = (parcel) => [
  generateESCPOSReceipt(parcel, 0),
  generateESCPOSReceipt(parcel, 0),
  generateESCPOSReceipt(parcel, 1),
];