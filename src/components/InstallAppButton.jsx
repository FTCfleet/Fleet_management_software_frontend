import { useState, useEffect } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import { MdInstallMobile } from 'react-icons/md';

const InstallAppButton = ({ isDarkMode, colors, fullWidth = false, alwaysShow = false }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(alwaysShow);
  const [isInstalled, setIsInstalled] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isStandalone);
    
    if (isStandalone && !alwaysShow) {
      setShowInstallButton(false);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      // Show install button
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [alwaysShow]);

  const handleInstallClick = async () => {
    // Check if already installed
    if (isInstalled) {
      setToast({
        open: true,
        message: 'App is already installed! Open it from your home screen.',
        severity: 'success'
      });
      return;
    }

    if (!deferredPrompt) {
      // Provide helpful instructions
      const isAndroid = /android/i.test(navigator.userAgent);
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      
      let message = 'Installation not available. ';
      if (isIOS) {
        message += 'On iOS: Tap Share button → Add to Home Screen';
      } else if (isAndroid) {
        message += 'On Android: Open in Chrome → Menu (⋮) → Install app';
      } else {
        message += 'Use Chrome or Edge browser for installation';
      }
      
      setToast({
        open: true,
        message,
        severity: 'info'
      });
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setToast({
        open: true,
        message: 'App installed successfully!',
        severity: 'success'
      });
      setIsInstalled(true);
      if (!alwaysShow) {
        setShowInstallButton(false);
      }
    } else {
      setToast({
        open: true,
        message: 'Installation cancelled',
        severity: 'info'
      });
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
  };

  if (!showInstallButton) {
    return null;
  }

  return (
    <>
      <Button
        variant="contained"
        startIcon={<MdInstallMobile size={20} />}
        onClick={handleInstallClick}
        fullWidth={fullWidth}
        sx={{
          backgroundColor: isInstalled 
            ? (isDarkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)')
            : (isDarkMode ? '#FFB74D' : '#1E3A5F'),
          color: isInstalled 
            ? '#22c55e'
            : (isDarkMode ? '#0a1628' : '#fff'),
          fontWeight: 600,
          px: 2.5,
          py: fullWidth ? 1.5 : 1,
          borderRadius: fullWidth ? '12px' : '8px',
          fontSize: fullWidth ? '0.95rem' : '0.875rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          textTransform: 'none',
          border: isInstalled ? '1px solid #22c55e' : 'none',
          '&:hover': {
            backgroundColor: isInstalled
              ? (isDarkMode ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.15)')
              : (isDarkMode ? '#FFA726' : '#2d5a87'),
            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
            transform: fullWidth ? 'translateY(-1px)' : 'none',
          },
          transition: 'all 0.2s ease',
        }}
      >
        {isInstalled ? 'App Installed ✓' : 'Install App'}
      </Button>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default InstallAppButton;
