import PropTypes from "prop-types";
import { memo } from "react";
import {
  Modal,
  Box,
  IconButton,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  CircularProgress,
} from "@mui/material";
import { Close } from "@mui/icons-material";

const ClientModal = memo(function ClientModal({
  open,
  onClose,
  client = null,
  onFieldChange,
  onSubmit,
  isAdding,
  isSubmitting,
  isDarkMode = false,
  colors = {},
}) {
  if (!client) {
    return null;
  }

  const senderValue = typeof client.isSender === "boolean" ? client.isSender : true;

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc",
    },
    "& .MuiInputLabel-root": { color: colors?.textSecondary },
    "& .MuiOutlinedInput-input": { color: colors?.textPrimary },
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 480 },
          maxWidth: 480,
          maxHeight: "90vh",
          bgcolor: isDarkMode ? "#1a2332" : "#ffffff",
          borderRadius: "16px",
          boxShadow: isDarkMode 
            ? "0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)" 
            : "0 25px 50px rgba(0,0,0,0.15)",
          p: 3,
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <Box sx={{ position: "relative", mb: 3 }}>
          <IconButton
            onClick={onClose}
            sx={{ 
              position: "absolute", 
              top: -8, 
              right: -8,
              color: colors?.textSecondary,
              "&:hover": { backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }
            }}
          >
            <Close />
          </IconButton>
          <Typography
            variant="h5"
            sx={{ 
              color: colors?.textPrimary,
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            {isAdding ? "Add New Client" : "Edit Client Details"}
          </Typography>
        </Box>

        {/* Content */}
        <Box>
          <TextField
            fullWidth
            label="Client Name"
            value={client.name ?? ""}
            onChange={(e) => onFieldChange("name", e.target.value.toUpperCase())}
            sx={{ ...inputSx, mb: 2.5 }}
          />
          <TextField
            fullWidth
            label="Phone Number"
            value={client.phoneNo ?? ""}
            onChange={(e) => onFieldChange("phoneNo", e.target.value)}
            sx={{ ...inputSx, mb: 2.5 }}
          />
          <TextField
            fullWidth
            label="Client Address"
            value={client.address ?? ""}
            onChange={(e) => onFieldChange("address", e.target.value.toUpperCase())}
            multiline
            rows={2}
            sx={{ ...inputSx, mb: 2.5 }}
          />
          <TextField
            fullWidth
            label="GST Number"
            value={client.gst ?? ""}
            onChange={(e) => onFieldChange("gst", e.target.value.toUpperCase())}
            sx={{ ...inputSx, mb: 2.5 }}
          />

          <ToggleButtonGroup
            value={senderValue}
            exclusive
            onChange={(e, newValue) => {
              if (newValue !== null) {
                onFieldChange("isSender", newValue);
              }
            }}
            sx={{ display: "flex", mb: 3, width: "100%" }}
          >
            <ToggleButton
              value={true}
              sx={{
                flex: 1,
                py: 1.2,
                borderRadius: "12px 0 0 12px !important",
                fontWeight: 600,
                backgroundColor: senderValue
                  ? (isDarkMode ? "#FFB74D" : "#1D3557")
                  : (isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc"),
                color: senderValue 
                  ? (isDarkMode ? "#0a1628" : "#fff") 
                  : (isDarkMode ? colors?.textSecondary : "#64748b"),
                border: isDarkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
                "&.Mui-selected, &.Mui-selected:hover": {
                  backgroundColor: isDarkMode ? "#FFB74D" : "#1D3557",
                  color: isDarkMode ? "#0a1628" : "#fff",
                },
              }}
            >
              Sender
            </ToggleButton>
            <ToggleButton
              value={false}
              sx={{
                flex: 1,
                py: 1.2,
                borderRadius: "0 12px 12px 0 !important",
                fontWeight: 600,
                backgroundColor: !senderValue
                  ? (isDarkMode ? "#FFB74D" : "#1D3557")
                  : (isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc"),
                color: !senderValue 
                  ? (isDarkMode ? "#0a1628" : "#fff") 
                  : (isDarkMode ? colors?.textSecondary : "#64748b"),
                border: isDarkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
                "&.Mui-selected, &.Mui-selected:hover": {
                  backgroundColor: isDarkMode ? "#FFB74D" : "#1D3557",
                  color: isDarkMode ? "#0a1628" : "#fff",
                },
              }}
            >
              Receiver
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            fullWidth
            variant="contained"
            onClick={onSubmit}
            disabled={isSubmitting}
            sx={{
              py: 1.5,
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "none",
              background: isDarkMode 
                ? "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)"
                : "linear-gradient(135deg, #1D3557 0%, #0a1628 100%)",
              color: isDarkMode ? "#0a1628" : "#fff",
              boxShadow: "none",
              "&:hover": {
                background: isDarkMode 
                  ? "linear-gradient(135deg, #FFA726 0%, #F57C00 100%)"
                  : "linear-gradient(135deg, #25445f 0%, #0f2035 100%)",
                boxShadow: "none",
              },
              "&:disabled": {
                background: isDarkMode ? "rgba(255,183,77,0.3)" : "rgba(29,53,87,0.3)",
              }
            }}
          >
            {isAdding ? "Add Client" : "Save Changes"}
            {isSubmitting && (
              <CircularProgress
                size={20}
                sx={{ color: isDarkMode ? "#0a1628" : "#fff", ml: 1 }}
              />
            )}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
});

ClientModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  client: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    phoneNo: PropTypes.string,
    address: PropTypes.string,
    gst: PropTypes.string,
    isSender: PropTypes.bool,
  }),
  onFieldChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isAdding: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  isDarkMode: PropTypes.bool,
  colors: PropTypes.object,
};

export default ClientModal;
