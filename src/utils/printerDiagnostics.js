/**
 * Comprehensive QZ Tray Printer Diagnostics
 * Tests every known label printer language, encoding, and line-ending variant.
 * Logs everything to console AND remote backend so you can inspect from the server.
 *
 * Usage:
 *   const report = await runPrinterDiagnostics(printerName, (pct, msg) => setProgress(msg));
 *   // Check server logs for full detail; check physically which test label printed.
 */

import { connectQZTray, disconnectQZTray, isQZTrayAvailable } from './qzTrayUtils.js';

const BASE_URL = import.meta.env.VITE_BASE_URL;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Dual log: browser console + remote backend */
const dlog = async (level, message, data = {}) => {
  const entry = { level, message, data, timestamp: new Date().toISOString(), source: 'printer-diag' };
  // Always console.log for local visibility
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  fn(`[DIAG][${level.toUpperCase()}] ${message}`, data);
  try {
    const token = localStorage.getItem('token');
    await fetch(`${BASE_URL}/api/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(entry),
    });
  } catch (_) {}
  return entry;
};

/** Show first N bytes as hex pairs */
const toHex = (str, n = 64) =>
  Array.from(str.slice(0, n), c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ')
  + (str.length > n ? ` … (+${str.length - n} more bytes)` : '');

/** Escape control characters for readable logging */
const escapeCtrl = (str, n = 120) =>
  str.slice(0, n).replace(/[\x00-\x1F\x7F]/g, c =>
    ({ '\r': '\\r', '\n': '\\n', '\t': '\\t', '\f': '\\f', '\x1B': '\\x1B' }[c]
      ?? `\\x${c.charCodeAt(0).toString(16).padStart(2, '0')}`))
  + (str.length > n ? `… (+${str.length - n})` : '');

/** Encode string to base64 safely (handles extended chars) */
const toBase64 = (str) => {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach(b => (binary += String.fromCharCode(b)));
  return btoa(binary);
};

/* ------------------------------------------------------------------ */
/* Payload definitions                                                 */
/* ------------------------------------------------------------------ */

const buildPayloads = () => {
  const bplzCrLf =
    '^XA\r\n' +
    '^FO30,20^A0N,40,40^FDFTC BPLZ CRLF^FS\r\n' +
    '^FO30,80^A0N,25,25^FDBarcodes printing test^FS\r\n' +
    '^XZ\r\n';

  const bplzLf =
    '^XA\n' +
    '^FO30,20^A0N,40,40^FDFTC BPLZ LF^FS\n' +
    '^FO30,80^A0N,25,25^FDBarcodes printing test^FS\n' +
    '^XZ\n';

  const tsplCrLf = [
    'SIZE 100 mm,50 mm',
    'GAP 3 mm,0 mm',
    'DENSITY 8',
    'DIRECTION 0',
    'CLS',
    'TEXT 10,10,"3",0,2,2,"FTC TSPL CRLF"',
    'TEXT 10,70,"3",0,1,1,"Barcode printing test"',
    'PRINT 1,1',
    'END',
  ].join('\r\n') + '\r\n';

  const tsplLf = [
    'SIZE 100 mm,50 mm',
    'GAP 3 mm,0 mm',
    'DENSITY 8',
    'DIRECTION 0',
    'CLS',
    'TEXT 10,10,"3",0,2,2,"FTC TSPL LF"',
    'TEXT 10,70,"3",0,1,1,"Barcode printing test"',
    'PRINT 1,1',
    'END',
  ].join('\n') + '\n';

  const epl2 =
    'N\r\n' +
    'q812\r\n' +
    'Q406,26\r\n' +
    'A30,20,0,4,1,1,N,"FTC EPL2 TEST"\r\n' +
    'A30,80,0,3,1,1,N,"Barcode printing test"\r\n' +
    'P1\r\n';

  const escPosInit = '\x1B\x40'; // ESC @ = printer init/reset

  const escPosText =
    '\x1B\x40' +          // init
    '\x1B\x61\x01' +      // center align
    'FTC ESC/POS TEST\n' +
    'Barcode printing test\n' +
    '\n\n\n' +
    '\x1D\x56\x41\x00';  // partial cut

  const plainAscii = 'FTC PLAIN TEXT TEST\r\nBarcode printing test\r\n\f';

  const formFeed = '\x0C'; // 1 byte — ejects current label/page if understood

  const gdiHtml = `<!DOCTYPE html><html><body style="margin:0;padding:8px;font-family:Arial;text-align:center;">
<h2 style="font-size:14px;margin:0 0 6px;">FTC GDI TEST</h2>
<p style="font-size:10px;margin:0 0 3px;">Barcode printing test</p>
<p style="font-size:9px;margin:0;">If this prints → use GDI mode</p>
</body></html>`;

  return [
    // ---- 1. Fundamental byte tests ----
    {
      key: 'formFeed',
      name: 'Form Feed (0x0C)',
      desc: '1 byte. If printer ejects a label/paper at all, raw byte delivery is confirmed.',
      type: 'raw', format: 'plain',
      data: formFeed,
    },
    {
      key: 'escReset',
      name: 'ESC @ (ESC/POS reset)',
      desc: 'Universal reset command. If printer beeps or moves feed, it understands ESC/POS bytes.',
      type: 'raw', format: 'plain',
      data: escPosInit,
    },
    {
      key: 'plainAscii',
      name: 'Plain ASCII text',
      desc: 'Pure ASCII + form-feed. If any text appears the printer has a text/passthrough mode.',
      type: 'raw', format: 'plain',
      data: plainAscii,
    },

    // ---- 2. Label languages — plain format ----
    {
      key: 'bplzCrLf',
      name: 'BPLZ/ZPL (CRLF)',
      desc: 'SNBC BPLZ / standard ZPL with \\r\\n. Expected language for SNBC printers.',
      type: 'raw', format: 'plain',
      data: bplzCrLf,
    },
    {
      key: 'bplzLf',
      name: 'BPLZ/ZPL (LF only)',
      desc: 'Same ZPL with \\n only. Some ZPL parsers require this.',
      type: 'raw', format: 'plain',
      data: bplzLf,
    },
    {
      key: 'tsplCrLf',
      name: 'TSPL (CRLF)',
      desc: 'TSC Printer Script Language with \\r\\n. Used by TVS/TSC printers.',
      type: 'raw', format: 'plain',
      data: tsplCrLf,
    },
    {
      key: 'tsplLf',
      name: 'TSPL (LF only)',
      desc: 'Same TSPL with \\n only.',
      type: 'raw', format: 'plain',
      data: tsplLf,
    },
    {
      key: 'epl2',
      name: 'EPL2',
      desc: 'Eltron Programming Language 2 — used by older Zebra/Eltron label printers.',
      type: 'raw', format: 'plain',
      data: epl2,
    },
    {
      key: 'escPos',
      name: 'ESC/POS (thermal receipt)',
      desc: 'Full ESC/POS receipt with cut. Expected to work on RP3230, unlikely on label printers.',
      type: 'raw', format: 'plain',
      data: escPosText,
    },

    // ---- 3. Base64 variants (eliminates string-encoding as root cause) ----
    {
      key: 'bplzBase64',
      name: 'BPLZ/ZPL base64-encoded',
      desc: 'Same ZPL content sent as base64 bytes. If this prints but plain BPLZ did not, the issue is string encoding in QZ Tray.',
      type: 'raw', format: 'base64',
      data: toBase64(bplzCrLf),
    },
    {
      key: 'tsplBase64',
      name: 'TSPL base64-encoded',
      desc: 'Same TSPL content sent as base64 bytes.',
      type: 'raw', format: 'base64',
      data: toBase64(tsplCrLf),
    },

    // ---- 4. GDI fallback (Windows driver, not raw) ----
    {
      key: 'gdiHtml',
      name: 'GDI/HTML (Windows driver)',
      desc: 'Rendered by Windows GDI through the printer driver. Works regardless of command language. If only this prints, the driver is GDI-only and raw commands are blocked.',
      type: 'pixel', format: 'html',
      data: gdiHtml,
    },
  ];
};

/* ------------------------------------------------------------------ */
/* Single-payload sender                                               */
/* ------------------------------------------------------------------ */

const sendOnePayload = async (printerName, payload, index, total) => {
  const { key, name, desc, type, format, data } = payload;
  const t0 = Date.now();

  const hexPreview = (type === 'raw' && format === 'plain')
    ? toHex(data)
    : `(${format}, ${data.length} chars)`;

  await dlog('info', `[${index}/${total}] Sending: ${name}`, {
    key, desc,
    byteCount: data.length,
    hexPreview,
    escaped: type === 'raw' ? escapeCtrl(data) : '(html)',
    type, format,
  });

  // Build QZ print job
  let printJob;
  if (type === 'pixel') {
    printJob = [{ type: 'pixel', format: 'html', flavor: 'plain', options: { pageWidth: 4, pageHeight: 2, units: 'in' }, data }];
  } else {
    printJob = [{ type: 'raw', format, data }];
  }

  // Config: GDI copies handled via config, raw default
  const config = type === 'pixel'
    ? qz.configs.create(printerName, { copies: 1 })
    : qz.configs.create(printerName);

  const result = { key, name, desc, type, format, byteCount: data.length };

  try {
    await qz.print(config, printJob);
    result.status = 'accepted';
    result.elapsedMs = Date.now() - t0;
    await dlog('info', `[${index}/${total}] ✓ ACCEPTED by spooler: ${name}`, { elapsedMs: result.elapsedMs });
  } catch (err) {
    result.status = 'error';
    result.error = err.message;
    await dlog('error', `[${index}/${total}] ✗ FAILED: ${name}`, { error: err.message });
  }

  return result;
};

/* ------------------------------------------------------------------ */
/* Main diagnostic runner                                              */
/* ------------------------------------------------------------------ */

/**
 * Run full printer diagnostics.
 * @param {string} printerName  - Exact Windows printer name
 * @param {function} onProgress - (pct: number, message: string) => void
 * @returns {Promise<Object>}   - Full diagnostic report
 */
export const runPrinterDiagnostics = async (printerName, onProgress = () => {}) => {
  const report = {
    timestamp: new Date().toISOString(),
    printerName,
    userAgent: navigator.userAgent,
    qzVersion: null,
    connectionInfo: {},
    allPrinters: [],
    printerFound: false,
    printerFoundAs: null,
    tests: [],
    recommendation: '',
    rawSummary: '',
  };

  await dlog('info', '════════ PRINTER DIAGNOSTICS START ════════', {
    printerName,
    userAgent: navigator.userAgent,
    timestamp: report.timestamp,
  });
  onProgress(0, 'Starting…');

  // ── 1. QZ Tray loaded? ──────────────────────────────────────────
  if (!isQZTrayAvailable()) {
    report.recommendation = 'QZ Tray script not loaded. Ensure qz-tray.js is included in index.html.';
    await dlog('error', 'QZ Tray not available on window', {});
    return report;
  }
  await dlog('info', 'QZ Tray script detected', { qzType: typeof window.qz });

  // ── 2. Connect ───────────────────────────────────────────────────
  onProgress(5, 'Connecting to QZ Tray WebSocket…');
  try {
    await connectQZTray();
    report.connectionInfo = {
      connected: true,
      websocketActive: qz.websocket.isActive(),
    };
    await dlog('info', 'QZ Tray WebSocket connected', report.connectionInfo);
  } catch (err) {
    report.recommendation = `Cannot connect to QZ Tray WebSocket: ${err.message}`;
    await dlog('error', 'QZ Tray connect failed', { error: err.message });
    return report;
  }

  // ── 3. QZ version ────────────────────────────────────────────────
  onProgress(10, 'Reading QZ Tray version…');
  try {
    report.qzVersion = await qz.api.getVersion();
    await dlog('info', 'QZ Tray version', { version: report.qzVersion });
  } catch (err) {
    report.qzVersion = 'unknown';
    await dlog('warn', 'Could not read QZ version', { error: err.message });
  }

  // ── 4. Enumerate all printers ────────────────────────────────────
  onProgress(15, 'Enumerating all installed printers…');
  try {
    report.allPrinters = await qz.printers.find();
    await dlog('info', 'All installed printers', {
      count: report.allPrinters.length,
      printers: report.allPrinters,
    });
  } catch (err) {
    await dlog('error', 'Could not enumerate printers', { error: err.message });
  }

  // ── 5. Locate target printer ─────────────────────────────────────
  onProgress(20, `Searching for "${printerName}"…`);
  try {
    const found = await qz.printers.find(printerName);
    report.printerFound = Array.isArray(found) ? found.length > 0 : !!found;
    report.printerFoundAs = found;
    await dlog('info', 'Target printer search', {
      searchName: printerName,
      found,
      matched: report.printerFound,
    });
  } catch (err) {
    report.printerFound = false;
    await dlog('error', 'Printer search error', { printerName, error: err.message });
  }

  // ── 6. Run payload tests ─────────────────────────────────────────
  const payloads = buildPayloads();
  const total = payloads.length;

  await dlog('info', `Starting ${total} payload tests`, {
    tests: payloads.map(p => p.name),
  });

  for (let i = 0; i < payloads.length; i++) {
    const payload = payloads[i];
    const pct = 25 + Math.floor((i / total) * 65);
    onProgress(pct, `[${i + 1}/${total}] ${payload.name}`);

    const result = await sendOnePayload(printerName, payload, i + 1, total);
    report.tests.push(result);

    // Give printer time to process each job before sending the next
    await new Promise(r => setTimeout(r, 1200));
  }

  // ── 7. Disconnect ────────────────────────────────────────────────
  onProgress(93, 'Disconnecting from QZ Tray…');
  try { await disconnectQZTray(); } catch (_) {}

  // ── 8. Build summary ─────────────────────────────────────────────
  onProgress(100, 'Building summary…');

  const accepted = report.tests.filter(t => t.status === 'accepted');
  const failed   = report.tests.filter(t => t.status === 'error');

  report.rawSummary = [
    '════════ DIAGNOSTIC SUMMARY ════════',
    `Printer name : ${printerName}`,
    `QZ version   : ${report.qzVersion}`,
    `Printer found: ${report.printerFound} (${JSON.stringify(report.printerFoundAs)})`,
    `All printers : ${report.allPrinters.join(' | ') || '(none)'}`,
    '',
    `Jobs ACCEPTED by spooler (${accepted.length}/${total}):`,
    ...accepted.map(t => `  ✓ ${t.name}`),
    '',
    `Jobs REJECTED/ERROR (${failed.length}/${total}):`,
    ...failed.map(t => `  ✗ ${t.name} — ${t.error}`),
    '',
    'NEXT STEP — check physically which label printed, then:',
    '  BPLZ (CRLF) printed → localStorage.setItem("barcodePrinterLanguage","bplz")',
    '  TSPL (CRLF) printed → localStorage.setItem("barcodePrinterLanguage","tspl")',
    '  EPL2 printed        → localStorage.setItem("barcodePrinterLanguage","epl2")',
    '  GDI/HTML printed    → localStorage.setItem("barcodePrinterLanguage","gdi")',
    '  Nothing printed but jobs accepted → GDI driver is intercepting raw data.',
    '    Try GDI mode first, or install a "Generic / Text Only" port driver.',
    '  Form Feed moved paper → raw bytes reach print engine; language is wrong.',
    '════════════════════════════════════',
  ].join('\n');

  report.recommendation = accepted.length === 0
    ? 'All jobs were rejected. Check the printer name, driver installation, and QZ Tray raw printing permissions (QZ Tray → Printer → Allow RAW).'
    : `${accepted.length} job(s) accepted by spooler. Physically inspect which label printed, then set barcodePrinterLanguage accordingly.`;

  await dlog('info', '════════ DIAGNOSTICS COMPLETE ════════', {
    qzVersion       : report.qzVersion,
    allPrinters     : report.allPrinters,
    printerFound    : report.printerFound,
    acceptedCount   : accepted.length,
    failedCount     : failed.length,
    acceptedTests   : accepted.map(t => t.name),
    failedTests     : failed.map(t => ({ name: t.name, error: t.error })),
    rawSummary      : report.rawSummary,
    recommendation  : report.recommendation,
  });

  return report;
};

/* ------------------------------------------------------------------ */
/* Multi-printer diagnostic runner (single QZ connection)              */
/* ------------------------------------------------------------------ */

/**
 * Run full diagnostics against multiple printers with a single QZ Tray
 * connection (avoids a second security popup).
 * @param {string[]} printerNames  - Array of exact Windows printer names
 * @param {function} onProgress    - (pct: number, message: string) => void
 * @returns {Promise<Object>}      - { qzVersion, allPrinters, reports[] }
 */
export const runMultiPrinterDiagnostics = async (printerNames, onProgress = () => {}) => {
  const masterReport = {
    timestamp: new Date().toISOString(),
    qzVersion: null,
    allPrinters: [],
    reports: [],
  };

  await dlog('info', '════════ MULTI-PRINTER DIAGNOSTICS START ════════', {
    printers: printerNames,
    timestamp: masterReport.timestamp,
    userAgent: navigator.userAgent,
  });
  onProgress(0, 'Starting…');

  if (!isQZTrayAvailable()) {
    await dlog('error', 'QZ Tray not available on window', {});
    return masterReport;
  }

  // ── Connect once ─────────────────────────────────────────────────
  onProgress(2, 'Connecting to QZ Tray…');
  try {
    await connectQZTray();
    await dlog('info', 'QZ Tray connected', { active: qz.websocket.isActive() });
  } catch (err) {
    await dlog('error', 'QZ Tray connect failed', { error: err.message });
    return masterReport;
  }

  // ── Version ───────────────────────────────────────────────────────
  try {
    masterReport.qzVersion = await qz.api.getVersion();
    await dlog('info', 'QZ version', { version: masterReport.qzVersion });
  } catch (err) {
    masterReport.qzVersion = 'unknown';
  }

  // ── All printers (once) ───────────────────────────────────────────
  onProgress(5, 'Enumerating installed printers…');
  try {
    masterReport.allPrinters = await qz.printers.find();
    await dlog('info', 'All installed printers', {
      count: masterReport.allPrinters.length,
      printers: masterReport.allPrinters,
    });
  } catch (err) {
    await dlog('error', 'Could not enumerate printers', { error: err.message });
  }

  const payloads = buildPayloads();
  const totalPayloads = payloads.length;
  const totalPrinters = printerNames.length;

  // ── Test each printer ─────────────────────────────────────────────
  for (let pi = 0; pi < totalPrinters; pi++) {
    const printerName = printerNames[pi];
    const printerReport = {
      printerName,
      printerFound: false,
      printerFoundAs: null,
      tests: [],
      recommendation: '',
    };

    const basePct    = 5 + Math.floor((pi / totalPrinters) * 88);
    const rangePct   = Math.floor(88 / totalPrinters);

    await dlog('info', `════ Printer ${pi + 1}/${totalPrinters}: "${printerName}" ════`, {});
    onProgress(basePct, `[${pi + 1}/${totalPrinters}] Searching "${printerName}"…`);

    try {
      const found = await qz.printers.find(printerName);
      printerReport.printerFound = Array.isArray(found) ? found.length > 0 : !!found;
      printerReport.printerFoundAs = found;
      await dlog('info', 'Printer search', { printerName, found, matched: printerReport.printerFound });
    } catch (err) {
      await dlog('error', 'Printer search error', { printerName, error: err.message });
    }

    for (let i = 0; i < totalPayloads; i++) {
      const payload = payloads[i];
      const pct = basePct + Math.floor(((i + 1) / totalPayloads) * rangePct);
      onProgress(pct, `[${pi + 1}/${totalPrinters}] [${i + 1}/${totalPayloads}] ${payload.name}`);

      const result = await sendOnePayload(printerName, payload, i + 1, totalPayloads);
      printerReport.tests.push(result);

      await new Promise(r => setTimeout(r, 1200));
    }

    const accepted = printerReport.tests.filter(t => t.status === 'accepted');
    const failed   = printerReport.tests.filter(t => t.status === 'error');

    printerReport.recommendation = accepted.length === 0
      ? `All ${totalPayloads} jobs rejected — check printer name/driver/QZ RAW permission.`
      : `${accepted.length}/${totalPayloads} accepted — inspect physically which label printed.`;

    await dlog('info', `════ Done: "${printerName}" ════`, {
      printerFound : printerReport.printerFound,
      accepted     : accepted.map(t => t.name),
      failed       : failed.map(t => ({ name: t.name, error: t.error })),
      recommendation: printerReport.recommendation,
    });

    masterReport.reports.push(printerReport);
  }

  // ── Disconnect ────────────────────────────────────────────────────
  onProgress(96, 'Disconnecting…');
  try { await disconnectQZTray(); } catch (_) {}

  // ── Combined summary ──────────────────────────────────────────────
  onProgress(100, 'Done.');

  await dlog('info', '════════ MULTI-PRINTER DIAGNOSTICS COMPLETE ════════', {
    qzVersion  : masterReport.qzVersion,
    allPrinters: masterReport.allPrinters,
    perPrinter : masterReport.reports.map(r => ({
      printer : r.printerName,
      found   : r.printerFound,
      accepted: r.tests.filter(t => t.status === 'accepted').map(t => t.name),
      failed  : r.tests.filter(t => t.status === 'error').map(t => t.name),
      recommendation: r.recommendation,
    })),
    nextStep: [
      'Check which label(s) physically printed, then set localStorage:',
      '  BPLZ printed → barcodePrinterLanguage = "bplz"',
      '  TSPL printed → barcodePrinterLanguage = "tspl"',
      '  EPL2 printed → barcodePrinterLanguage = "epl2"',
      '  GDI/HTML printed → barcodePrinterLanguage = "gdi"',
      'Set barcodePrinterName to whichever printer responded.',
    ].join('\n'),
  });

  return masterReport;
};
