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

const SIZE_1X   = GS + '!' + '\x00';
const SIZE_W2   = GS + '!' + '\x10';
const SIZE_2X   = GS + '!' + '\x11';

const CUT       = GS + 'V' + 'A' + '\x00';

/* 80mm = ~42 characters */
const LINE = '-'.repeat(42);

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

/* Column widths (important for alignment) */
const ITEM_W = 20;
const QTY_W  = 6;
const AMT_W  = 10;

/* -------------------------------------------------- */
/* MAIN RECEIPT                                        */
/* -------------------------------------------------- */

export const generateESCPOSReceipt = (parcel, auto = 0) => {

  let receipt = '';

  receipt += INIT + ALIGN_L + SIZE_1X;

  /* ---------- Date ---------- */
  receipt += `Date: ${dateFormatter(parcel.placedAt)}  `;
  receipt += `Created By: ${parcel.addedBy?.name || "____"}${LF}`;

  /* ---------- Company ---------- */
  receipt += ALIGN_C + SIZE_2X + BOLD_ON;
  receipt += 'FRIENDS TRANSPORT CO.' + LF;
  receipt += SIZE_1X + BOLD_OFF;

  /* ---------- LR ---------- */
  receipt += SIZE_W2 + BOLD_ON;
  receipt += `LR No: ${parcel.trackingId}${LF}`;
  receipt += SIZE_1X + BOLD_OFF;

  /* ---------- Phones (CENTERED) ---------- */
  receipt += ALIGN_C;
  receipt += `${parcel.sourceWarehouse.warehouseID} Ph.: ${parcel.sourceWarehouse.phoneNo || "____"}   `;
  receipt += `${parcel.destinationWarehouse.warehouseID} Ph.: ${parcel.destinationWarehouse.phoneNo || "____"}${LF}`;

  /* ---------- Track URL (CENTERED + bold only) ---------- */
  receipt += BOLD_ON + 'Track your order at: www.friendstransport.in' + BOLD_OFF + LF + LF;

  receipt += ALIGN_L;

  /* ---------- From / To ---------- */
  receipt += BOLD_ON + 'From: ' + BOLD_OFF + `${parcel.sourceWarehouse.name}${LF}`;
  receipt += BOLD_ON + 'To: '   + BOLD_OFF + `${parcel.destinationWarehouse.name}${LF}${LF}`;

  /* ---------- Consignor / Consignee ---------- */
  receipt += BOLD_ON;
  receipt += `Consignor: ${parcel.sender.name}${LF}`;
  receipt += `Ph: ${parcel.sender.phoneNo || "NA"}${LF}${LF}`;
  receipt += `Consignee: ${parcel.receiver.name}${LF}`;
  receipt += `Ph: ${parcel.receiver.phoneNo || "NA"}${LF}`;
  receipt += BOLD_OFF + LF;

  /* ---------- Table Header ---------- */
  receipt += LINE + LF;
  receipt += BOLD_ON;

  if (auto === 1 && parcel.payment === 'To Pay')
    receipt += 'No  Item'.padEnd(ITEM_W) + 'Qty'.padStart(QTY_W) + LF;
  else
    receipt += 'No  Item'.padEnd(ITEM_W) + 'Qty'.padStart(QTY_W) + 'Amount'.padStart(AMT_W) + LF;

  receipt += BOLD_OFF;
  receipt += LINE + LF;

  /* ---------- Items ---------- */

  let index = 1;
  let totalQty = 0;

  for (const item of parcel.items) {

    const qty = item.quantity || 0;
    totalQty += qty;

    const label = `${index}. ${item.name} (${item.itemType.name})`;

    if (auto === 1 && parcel.payment === 'To Pay') {

      receipt += label.padEnd(ITEM_W) + qty.toString().padStart(QTY_W) + LF;

    } else {

      const freight = displayValueNum(item.freight);
      const hamali  = displayValueNum(item.hamali);
      const rate = freight + hamali + hamali;
      const amount = rate * qty;

      const amtStr = amount === 0
        ? '____'
        : `Rs.${amount.toFixed(2)}`;

      receipt +=
        label.padEnd(ITEM_W) +
        qty.toString().padStart(QTY_W) +
        amtStr.padStart(AMT_W) +
        LF;
    }

    index++;
  }

  /* ---------- Totals (PERFECT COLUMN ALIGNMENT) ---------- */

  const totalFreight = displayValueNum(parcel.freight);
  const totalHamali  = displayValueNum(parcel.hamali);
  const totalAmount  = totalFreight + 2 * totalHamali;

  const amtStr = totalAmount === 0
    ? '____'
    : `Rs.${totalAmount.toFixed(2)}`;

  receipt += LINE + LF;
  receipt += BOLD_ON;

  if (auto === 1 && parcel.payment === 'To Pay') {
    receipt += 'Total'.padEnd(ITEM_W) + totalQty.toString().padStart(QTY_W) + LF;
  } else {
    receipt +=
      'Total'.padEnd(ITEM_W) +
      totalQty.toString().padStart(QTY_W) +
      amtStr.padStart(AMT_W) +
      LF;
  }

  receipt += BOLD_OFF;
  receipt += LINE + LF + LF;

  /* ---------- Footer ---------- */

  const doorDelivery = parcel.isDoorDelivery
    ? (auto ? 'Yes' : displayOrBlank(parcel.doorDeliveryCharge))
    : 'No';

  receipt += `Door Delivery: ${doorDelivery.padEnd(6)} `;
  receipt += BOLD_ON + `Payment: ${parcel.payment.toUpperCase()}` + BOLD_OFF + LF + LF;

  receipt += ALIGN_C;
  receipt += 'GST: 36AAFFF2744R1ZX' + LF;
  receipt += 'SUBJECT TO HYDERABAD JURISDICTION' + LF;
  receipt += 'WhatsApp: +917075124426' + LF;

  receipt += LF + LF + CUT;

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
