import React from "react";
import {
  Dialog,
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
  FaSignOutAlt 
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
        return <FaCheckCircle style={{ fontSize: "40px" }} />;
      case "error":
        return <FaExclamationTriangle style={{ fontSize: "40px" }} />;
      case "warning":
        return <FaExclamationTriangle style={{ fontSize: "40px" }} />;
      case "confirm":
        return <FaSignOutAlt style={{ fontSize: "40px" }} />;
      default:
        return <FaInfoCircle style={{ fontSize: "40px" }} />;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "#4CAF50";
      case "error":
        return "#ff6b6b";
      case "warning":
        return "#FFB74D";
      case "confirm":
        return "#FFB74D";
      default:
        return "#64C8FF";
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
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          background: "linear-gradient(180deg, rgba(29, 53, 87, 0.9) 0%, rgba(10, 22, 40, 0.95) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "24px",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          overflow: "hidden",
        },
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          color: "rgba(255,255,255,0.5)",
          "&:hover": { color: "#ffffff", background: "rgba(255,255,255,0.1)" },
        }}
      >
        <FaTimes size={16} />
      </IconButton>
      
      <DialogContent sx={{ textAlign: "center", pt: 5, pb: 3, px: 4 }}>
        {/* Icon */}
        <Box sx={{ 
          width: 80, 
          height: 80, 
          mx: "auto", 
          mb: 3, 
          background: `rgba(${type === "success" ? "76, 175, 80" : type === "error" ? "255, 107, 107" : "255, 183, 77"}, 0.15)`,
          borderRadius: "20px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          color: getIconColor(),
        }}>
          {getIcon()}
        </Box>
        
        {title && (
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 1.5,
              color: "#ffffff",
              fontSize: "1.35rem",
            }}
          >
            {title}
          </Typography>
        )}
        
        <Typography
          sx={{
            color: "rgba(255,255,255,0.7)",
            fontSize: "0.95rem",
            lineHeight: 1.6,
          }}
        >
          {message}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: "center", gap: 1.5, pb: 4, px: 4 }}>
        {showCancel && (
          <Button
            onClick={onClose}
            sx={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "rgba(255,255,255,0.8)",
              px: 3,
              py: 1.2,
              borderRadius: "12px",
              fontWeight: 600,
              textTransform: "none",
              fontSize: "0.95rem",
              minWidth: "100px",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.1)",
                borderColor: "rgba(255, 255, 255, 0.25)",
              },
            }}
          >
            {cancelText}
          </Button>
        )}
        
        <Button
          onClick={handleConfirm}
          sx={{
            background: type === "error" || type === "warning" || type === "confirm" 
              ? "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)" 
              : type === "success" 
                ? "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)"
                : "linear-gradient(135deg, #64C8FF 0%, #4db8ff 100%)",
            color: type === "error" || type === "warning" || type === "confirm" ? "#1D3557" : "#ffffff",
            px: 3,
            py: 1.2,
            borderRadius: "12px",
            fontWeight: 700,
            textTransform: "none",
            fontSize: "0.95rem",
            minWidth: "100px",
            boxShadow: type === "error" || type === "warning" || type === "confirm" 
              ? "0 4px 15px rgba(255, 183, 77, 0.3)" 
              : "0 4px 15px rgba(100, 200, 255, 0.3)",
            "&:hover": {
              boxShadow: type === "error" || type === "warning" || type === "confirm" 
                ? "0 6px 20px rgba(255, 183, 77, 0.4)" 
                : "0 6px 20px rgba(100, 200, 255, 0.4)",
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
