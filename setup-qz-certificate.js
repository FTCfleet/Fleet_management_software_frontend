#!/usr/bin/env node

/**
 * QZ Tray Certificate Setup Helper
 * 
 * This script helps you add your self-signed certificate to the QZ Tray utility.
 * 
 * Usage:
 * 1. Generate certificate files using OpenSSL (see instructions)
 * 2. Place digital-certificate.pem and private-key.pem in project root
 * 3. Run: node setup-qz-certificate.js
 * 4. The script will update src/utils/qzTrayUtils.js automatically
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CERT_FILE = 'digital-certificate.pem';
const KEY_FILE = 'private-key.pem';
const UTILS_FILE = 'src/utils/qzTrayUtils.js';

console.log('🔐 QZ Tray Certificate Setup\n');

// Check if certificate files exist
if (!fs.existsSync(CERT_FILE)) {
  console.error(`❌ Error: ${CERT_FILE} not found!`);
  console.log('\n📝 To generate a self-signed certificate, run:\n');
  console.log('openssl genrsa -out private-key.pem 2048');
  console.log('openssl req -new -key private-key.pem -out certificate.csr');
  console.log('openssl x509 -req -days 3650 -in certificate.csr -signkey private-key.pem -out digital-certificate.crt');
  console.log('openssl x509 -in digital-certificate.crt -out digital-certificate.pem -outform PEM\n');
  process.exit(1);
}

if (!fs.existsSync(KEY_FILE)) {
  console.error(`❌ Error: ${KEY_FILE} not found!`);
  process.exit(1);
}

// Read certificate and key
const certificate = fs.readFileSync(CERT_FILE, 'utf8').trim();
const privateKey = fs.readFileSync(KEY_FILE, 'utf8').trim();

console.log('✅ Certificate files found');
console.log('📄 Certificate length:', certificate.length, 'bytes');
console.log('🔑 Private key length:', privateKey.length, 'bytes\n');

// Read the utils file
if (!fs.existsSync(UTILS_FILE)) {
  console.error(`❌ Error: ${UTILS_FILE} not found!`);
  process.exit(1);
}

let utilsContent = fs.readFileSync(UTILS_FILE, 'utf8');

// Escape backticks and dollar signs in certificate and key
const escapedCert = certificate.replace(/`/g, '\\`').replace(/\$/g, '\\$');
const escapedKey = privateKey.replace(/`/g, '\\`').replace(/\$/g, '\\$');

// Replace certificate placeholder
utilsContent = utilsContent.replace(
  /const QZ_CERTIFICATE = `-----BEGIN CERTIFICATE-----\nYOUR_CERTIFICATE_HERE\n-----END CERTIFICATE-----`;/,
  `const QZ_CERTIFICATE = \`${escapedCert}\`;`
);

// Replace private key placeholder
utilsContent = utilsContent.replace(
  /const QZ_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----`;/,
  `const QZ_PRIVATE_KEY = \`${escapedKey}\`;`
);

// Enable certificate usage
utilsContent = utilsContent.replace(
  /const USE_CERTIFICATE = false;/,
  'const USE_CERTIFICATE = true;'
);

// Write back
fs.writeFileSync(UTILS_FILE, utilsContent, 'utf8');

console.log('✅ Certificate added to qzTrayUtils.js');
console.log('✅ Certificate signing enabled\n');

console.log('📋 Next Steps:');
console.log('1. Add certificate to QZ Tray:');
console.log('   - Open QZ Tray → Advanced → Site Manager → Certificates');
console.log('   - Click "Add" and select digital-certificate.pem');
console.log('   - Click "Trust"');
console.log('2. Restart your development server');
console.log('3. Test printing - no more certificate warnings!\n');

console.log('🎉 Setup complete!');
