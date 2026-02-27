#!/bin/bash

# QZ Tray Self-Signed Certificate Generator
# This script generates a FREE self-signed certificate for QZ Tray

echo "🔐 Generating QZ Tray Self-Signed Certificate"
echo "=============================================="
echo ""

# Check if OpenSSL is installed
if ! command -v openssl &> /dev/null; then
    echo "❌ Error: OpenSSL is not installed"
    echo "Install it using:"
    echo "  Ubuntu/Debian: sudo apt-get install openssl"
    echo "  macOS: brew install openssl"
    echo "  Windows: Download from https://slproweb.com/products/Win32OpenSSL.html"
    exit 1
fi

echo "✅ OpenSSL found"
echo ""

# Generate private key
echo "📝 Step 1: Generating private key..."
openssl genrsa -out private-key.pem 2048 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Private key generated: private-key.pem"
else
    echo "❌ Failed to generate private key"
    exit 1
fi
echo ""

# Generate certificate signing request
echo "📝 Step 2: Creating certificate signing request..."
echo "Please enter the following information:"
echo ""

openssl req -new -key private-key.pem -out certificate.csr \
    -subj "/C=IN/ST=Telangana/L=Hyderabad/O=Friends Transport Co/CN=friendstransport.in/emailAddress=info@friendstransport.in"

if [ $? -eq 0 ]; then
    echo "✅ Certificate signing request created: certificate.csr"
else
    echo "❌ Failed to create certificate signing request"
    exit 1
fi
echo ""

# Generate self-signed certificate (valid for 10 years)
echo "📝 Step 3: Generating self-signed certificate (valid for 10 years)..."
openssl x509 -req -days 3650 -in certificate.csr -signkey private-key.pem -out digital-certificate.crt 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Certificate generated: digital-certificate.crt"
else
    echo "❌ Failed to generate certificate"
    exit 1
fi
echo ""

# Convert to PEM format
echo "📝 Step 4: Converting to PEM format..."
openssl x509 -in digital-certificate.crt -out digital-certificate.pem -outform PEM
if [ $? -eq 0 ]; then
    echo "✅ PEM certificate created: digital-certificate.pem"
else
    echo "❌ Failed to convert certificate"
    exit 1
fi
echo ""

# Clean up CSR file
rm certificate.csr

echo "=============================================="
echo "🎉 Certificate generation complete!"
echo ""
echo "📁 Generated files:"
echo "  - private-key.pem (Keep this SECRET!)"
echo "  - digital-certificate.pem (Share this with QZ Tray)"
echo "  - digital-certificate.crt (Alternative format)"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Add certificate to your code:"
echo "   Run: node setup-qz-certificate.js"
echo ""
echo "2. Add certificate to QZ Tray (on each computer):"
echo "   - Open QZ Tray → Advanced → Site Manager"
echo "   - Go to 'Certificates' tab"
echo "   - Click 'Add' and select digital-certificate.pem"
echo "   - Click 'Trust'"
echo ""
echo "3. Restart your app and test printing"
echo ""
echo "⚠️  IMPORTANT: Keep private-key.pem secure and never share it!"
echo ""
