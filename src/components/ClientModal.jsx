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
  width: 400,
  maxHeight: "70vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
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

  const senderValue =
    typeof client.isSender === "boolean" ? client.isSender : true;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalContainerSx}>
        <IconButton
          color="error"
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <Close />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            marginBottom: "16px",
            textAlign: "center",
            ...(titleSx || {}),
          }}
        >
          {isAdding ? "Add Client" : "Edit Client Details"}
        </Typography>
        <TextField
          fullWidth
          label="Client Name"
          value={client.name ?? ""}
          onChange={(e) =>
            onFieldChange("name", e.target.value.toUpperCase())
          }
          sx={{ marginBottom: "16px" }}
        />
        <TextField
          fullWidth
          label="Phone Number"
          value={client.phoneNo ?? ""}
          onChange={(e) => onFieldChange("phoneNo", e.target.value)}
          sx={{ marginBottom: "16px" }}
        />
        <TextField
          fullWidth
          label="Client Address"
          value={client.address ?? ""}
          onChange={(e) =>
            onFieldChange("address", e.target.value.toUpperCase())
          }
          sx={{ marginBottom: "16px" }}
        />
        <TextField
          fullWidth
          label="GST Number"
          value={client.gst ?? ""}
          onChange={(e) =>
            onFieldChange("gst", e.target.value.toUpperCase())
          }
          sx={{ marginBottom: "16px" }}
        />

        <ToggleButtonGroup
          value={senderValue}
          exclusive
          onChange={(e, newValue) => {
            if (newValue !== null) {
              onFieldChange("isSender", newValue);
            }
          }}
          sx={{ display: "flex", marginBottom: "16px" }}
        >
          <ToggleButton
            value={true}
            sx={{
              flex: 1,
              backgroundColor: senderValue ? "#003366" : "inherit",
              color: senderValue ? "white" : "black",
              "&.Mui-selected, &.Mui-selected:hover": {
                backgroundColor: "#003366",
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
              backgroundColor: !senderValue ? "#003366" : "inherit",
              color: !senderValue ? "white" : "black",
              "&.Mui-selected, &.Mui-selected:hover": {
                backgroundColor: "#003366",
                color: "white",
              },
            }}
          >
            Receiver
          </ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isAdding ? "Add Client" : "Save Client"}
            {isSubmitting && (
              <CircularProgress size={22} sx={{ color: "#fff", ml: 1 }} />
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
  titleSx: PropTypes.object,
};

export default ClientModal;
