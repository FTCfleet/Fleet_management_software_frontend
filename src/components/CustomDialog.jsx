import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaInfoCircle, 
  FaTimes,
  FaQuestion 
} from "react-icons/fa";

const CustomDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  type = "info", // "success", "error", "warning", "info", "confirm"
  confirmText = "OK",
  cancelText = "Cancel",
  showCancel = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle style={{ color: "#4caf50", fontSize: "48px" }} />;
      case "error":
        return <FaExclamationTriangle style={{ color: "#f44336", fontSize: "48px" }} />;
      case "warning":
        return <FaExclamationTriangle style={{ color: "#ff9800", fontSize: "48px" }} />;
      case "confirm":
        return <FaQuestion style={{ color: "#2196f3", fontSize: "48px" }} />;
      default:
        return <FaInfoCircle style={{ color: "#2196f3", fontSize: "48px" }} />;
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case "error":
      case "warning":
        return "#f44336";
      case "success":
        return "#4caf50";
      default:
        return "#1E3A5F";
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          padding: 1,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "#64748b",
          }}
        >
          <FaTimes />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: "center", py: 2 }}>
        <Box sx={{ mb: 2 }}>
          {getIcon()}
        </Box>
        
        {title && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              marginBottom: 2,
              color: "#1E3A5F",
            }}
          >
            {title}
          </Typography>
        )}
        
        <Typography
          sx={{
            color: "#374151",
            fontSize: "1rem",
            lineHeight: 1.5,
          }}
        >
          {message}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: "center", gap: 1, pb: 2 }}>
        {showCancel && (
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: "#64748b",
              color: "#64748b",
              minWidth: "100px",
              "&:hover": {
                borderColor: "#374151",
                backgroundColor: "#f8fafc",
              },
            }}
          >
            {cancelText}
          </Button>
        )}
        
        <Button
          onClick={handleConfirm}
          variant="contained"
          sx={{
            backgroundColor: getConfirmButtonColor(),
            minWidth: "100px",
            "&:hover": {
              backgroundColor: getConfirmButtonColor(),
              opacity: 0.9,
            },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomDialog;