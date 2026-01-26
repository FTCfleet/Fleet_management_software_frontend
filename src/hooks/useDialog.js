import { useState } from "react";

export const useDialog = () => {
  const [dialogState, setDialogState] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
    confirmText: "OK",
    cancelText: "Cancel",
    showCancel: false,
    onConfirm: null,
  });

  const showDialog = ({
    title,
    message,
    type = "info",
    confirmText = "OK",
    cancelText = "Cancel",
    showCancel = false,
    onConfirm = null,
  }) => {
    setDialogState({
      open: true,
      title,
      message,
      type,
      confirmText,
      cancelText,
      showCancel,
      onConfirm,
    });
  };

  const hideDialog = () => {
    setDialogState(prev => ({ ...prev, open: false }));
  };

  // Convenience methods
  const showAlert = (message, title = "Alert") => {
    showDialog({ title, message, type: "info" });
  };

  const showSuccess = (message, title = "Success") => {
    showDialog({ title, message, type: "success" });
  };

  const showError = (message, title = "Error") => {
    showDialog({ title, message, type: "error" });
  };

  const showWarning = (message, title = "Warning") => {
    showDialog({ title, message, type: "warning" });
  };

  const showConfirm = (message, onConfirm, title = "Confirm") => {
    showDialog({
      title,
      message,
      type: "confirm",
      showCancel: true,
      confirmText: "Confirm",
      onConfirm,
    });
  };

  return {
    dialogState,
    showDialog,
    hideDialog,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showConfirm,
  };
};