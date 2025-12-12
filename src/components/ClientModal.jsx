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

const modalContainerSx = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 420,
  maxHeight: "85vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
  p: { xs: 2.5, sm: 3.5 },
};

const ClientModal = memo(function ClientModal({
  open,
  onClose,
  client = null,
  onFieldChange,
  onSubmit,
  isAdding,
  isSubmitting,
  titleSx = null,
}) {
  if (!client) {
    return null;
  }

  const senderValue = typeof client.isSender === "boolean" ? client.isSender : true;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalContainerSx}>
        <IconButton
          color="error"
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
          size="small"
        >
          <Close />
        </IconButton>
        
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            textAlign: "center",
            fontWeight: 700,
            color: "#1E3A5F",
            ...(titleSx || {}),
          }}
        >
          {isAdding ? "Add Client" : "Edit Client Details"}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            label="Client Name"
            value={client.name ?? ""}
            onChange={(e) => onFieldChange("name", e.target.value.toUpperCase())}
            size="small"
          />
          <TextField
            fullWidth
            label="Phone Number"
            value={client.phoneNo ?? ""}
            onChange={(e) => onFieldChange("phoneNo", e.target.value)}
            size="small"
          />
          <TextField
            fullWidth
            label="Client Address"
            value={client.address ?? ""}
            onChange={(e) => onFieldChange("address", e.target.value.toUpperCase())}
            size="small"
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            label="GST Number"
            value={client.gst ?? ""}
            onChange={(e) => onFieldChange("gst", e.target.value.toUpperCase())}
            size="small"
          />

          <ToggleButtonGroup
            value={senderValue}
            exclusive
            onChange={(e, newValue) => {
              if (newValue !== null) {
                onFieldChange("isSender", newValue);
              }
            }}
            sx={{ display: "flex" }}
            size="small"
          >
            <ToggleButton
              value={true}
              sx={{
                flex: 1,
                py: 1,
                "&.Mui-selected, &.Mui-selected:hover": {
                  backgroundColor: "#1E3A5F",
                  color: "white",
                },
              }}
            >
              Sender
            </ToggleButton>
            <ToggleButton
              value={false}
              sx={{
                flex: 1,
                py: 1,
                "&.Mui-selected, &.Mui-selected:hover": {
                  backgroundColor: "#1E3A5F",
                  color: "white",
                },
              }}
            >
              Receiver
            </ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end", mt: 1 }}>
            <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={onSubmit}
              disabled={isSubmitting}
              sx={{ backgroundColor: "#1E3A5F", "&:hover": { backgroundColor: "#25344E" } }}
            >
              {isAdding ? "Add" : "Save"}
              {isSubmitting && <CircularProgress size={18} sx={{ color: "#fff", ml: 1 }} />}
            </Button>
          </Box>
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
  titleSx: PropTypes.object,
};

export default ClientModal;
