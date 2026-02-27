@echo off
REM QZ Tray Self-Signed Certificate Generator for Windows

echo ================================
echo QZ Tray Certificate Generator
echo ================================
echo.

REM Check if OpenSSL is installed
where openssl >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: OpenSSL is not installed
    echo.
    echo Download and install OpenSSL from:
    echo https://slproweb.com/products/Win32OpenSSL.html
    echo.
    echo Or install via Chocolatey:
    echo choco install openssl
    echo.
    pause
    exit /b 1
)

echo OpenSSL found
echo.

REM Generate private key
echo Step 1: Generating private key...
openssl genrsa -out private-key.pem 2048 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Private key generated: private-key.pem
) else (
    echo Failed to generate private key
    pause
    exit /b 1
)
echo.

REM Generate certificate signing request
echo Step 2: Creating certificate signing request...
openssl req -new -key private-key.pem -out certificate.csr -subj "/C=IN/ST=Telangana/L=Hyderabad/O=Friends Transport Co/CN=friendstransport.in/emailAddress=info@friendstransport.in"
if %ERRORLEVEL% EQU 0 (
    echo Certificate signing request created: certificate.csr
) else (
    echo Failed to create certificate signing request
    pause
    exit /b 1
)
echo.

REM Generate self-signed certificate
echo Step 3: Generating self-signed certificate (valid for 10 years)...
openssl x509 -req -days 3650 -in certificate.csr -signkey private-key.pem -out digital-certificate.crt 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Certificate generated: digital-certificate.crt
) else (
    echo Failed to generate certificate
    pause
    exit /b 1
)
echo.

REM Convert to PEM format
echo Step 4: Converting to PEM format...
openssl x509 -in digital-certificate.crt -out digital-certificate.pem -outform PEM
if %ERRORLEVEL% EQU 0 (
    echo PEM certificate created: digital-certificate.pem
) else (
    echo Failed to convert certificate
    pause
    exit /b 1
)
echo.

REM Clean up
del certificate.csr

echo ================================
echo Certificate generation complete!
echo ================================
echo.
echo Generated files:
echo   - private-key.pem (Keep this SECRET!)
echo   - digital-certificate.pem (Share with QZ Tray)
echo   - digital-certificate.crt (Alternative format)
echo.
echo Next Steps:
echo.
echo 1. Add certificate to your code:
echo    Run: node setup-qz-certificate.js
echo.
echo 2. Add certificate to QZ Tray:
echo    - Open QZ Tray - Advanced - Site Manager
echo    - Go to 'Certificates' tab
echo    - Click 'Add' and select digital-certificate.pem
echo    - Click 'Trust'
echo.
echo 3. Restart your app and test printing
echo.
echo IMPORTANT: Keep private-key.pem secure!
echo.
pause
