import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";
import { useOutletContext } from "react-router-dom";
import { FaDownload, FaFileExcel, FaCalendarAlt, FaWarehouse, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
const BASE_URL = import.meta.env.VITE_BASE_URL;
import "../css/main.css";
import { getDate } from "../utils/dateFormatter";
import ModernSpinner from "../components/ModernSpinner";
import CustomDateRangePicker from "../components/CustomDateRangePicker";

export default function GenReportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  const [selectedStartDate, setSelectedStartDate] = useState(() => {
    const today = new Date();
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    return oneMonthAgo.toISOString().split("T")[0];
  });
  const [selectedEndDate, setSelectedEndDate] = useState(getDate());
  const [modalOpen, setModalOpen] = useState(false);
  const { isDarkMode, colors } = useOutletContext() || {};

  // Theme-aware colors
  const textPrimary = isDarkMode ? "#fff" : "#1E3A5F";
  const textSecondary = isDarkMode ? "rgba(255,255,255,0.7)" : "#64748b";
  const textMuted = isDarkMode ? "rgba(255,255,255,0.5)" : "#94a3b8";
  const cardBg = isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.95)";
  const cardBorder = isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.08)";
  const cardShadow = isDarkMode 
    ? "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
    : "0 8px 32px rgba(0, 0, 0, 0.1)";
  const inputBg = isDarkMode ? "rgba(255, 255, 255, 0.18)" : "rgba(30, 58, 95, 0.08)";
  const detailsBg = isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(30, 58, 95, 0.05)";

  const handleOpenModal = () => {
    if (selectedEndDate < selectedStartDate) {
      alert("End date cannot be earlier than start date.");
      return;
    }
    setModalOpen(true);
  };
  const handleCloseModal = () => setModalOpen(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const res = await fetch(`${BASE_URL}/api/admin/get-all-warehouses`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        const destinationWarehouses = (data.body || []).filter((a) => a.isSource === false);
        setWarehouses(destinationWarehouses);
      } else {
        console.error("Failed to fetch warehouses");
        setWarehouses([]);
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      setWarehouses([]);
    }
  };

  const formatDate = (dateString, type) => {
    const newYear = dateString.split("-")[0];
    const newMonth = dateString.split("-")[1];
    const newDay = dateString.split("-")[2];
    if (type === "show") {
      return `${newDay}/${newMonth}/${newYear}`;
    }
    return `${newDay}${newMonth}${newYear}`;
  };

  const handleStartDateChange = (newDate) => setSelectedStartDate(newDate);
  const handleEndDateChange = (newDate) => setSelectedEndDate(newDate);

  const selectStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: inputBg,
      color: textPrimary,
      "& fieldset": { borderColor: isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.15)" },
      "&:hover fieldset": { borderColor: isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)" },
      "&.Mui-focused fieldset": { borderColor: "#FFB74D", borderWidth: "2px" },
    },
    "& .MuiSelect-select": { color: textPrimary },
    "& .MuiSelect-icon": { color: textSecondary },
    "& .MuiInputLabel-root": { color: textSecondary },
    "& .MuiInputLabel-root.Mui-focused": { color: "#FFB74D" },
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        margin: "0 auto",
        padding: { xs: 2, md: 4 },
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            background: cardBg,
            backdropFilter: "blur(20px)",
            border: cardBorder,
            borderRadius: "24px",
            boxShadow: cardShadow,
            p: { xs: 3, md: 4 },
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                background: "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <FaFileExcel size={28} color="#1D3557" />
            </Box>
            <Typography
              variant="h4"
              sx={{ color: textPrimary, fontWeight: 800, fontSize: { xs: "1.5rem", md: "2rem" }, mb: 1 }}
            >
              Monthly Report
            </Typography>
            <Typography sx={{ color: textSecondary }}>
              Generate Excel reports for any station
            </Typography>
          </Box>

          {/* Form */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Station Select */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <FaWarehouse size={14} color="#FFB74D" />
                <Typography sx={{ color: textSecondary, fontSize: "0.9rem", fontWeight: 600 }}>
                  Select Station
                </Typography>
              </Box>
              <FormControl fullWidth sx={selectStyles}>
                <Select
                  value={destinationWarehouse}
                  onChange={(e) => setDestinationWarehouse(e.target.value)}
                  displayEmpty
                  disabled={isLoading}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        background: isDarkMode ? "#1D3557" : "#fff",
                        border: isDarkMode ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.1)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                        "& .MuiMenuItem-root": {
                          color: textPrimary,
                          "&:hover": { background: isDarkMode ? "rgba(255, 183, 77, 0.15)" : "rgba(255, 183, 77, 0.1)" },
                          "&.Mui-selected": { background: isDarkMode ? "rgba(255, 183, 77, 0.25)" : "rgba(255, 183, 77, 0.2)" },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    {isLoading ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <ModernSpinner size={16} />
                        <span>Loading stations...</span>
                      </Box>
                    ) : (
                      "Choose a station"
                    )}
                  </MenuItem>
                  {warehouses.map((w) => (
                    <MenuItem key={w.warehouseID} value={w.warehouseID}>{w.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Date Range */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <FaCalendarAlt size={14} color="#FFB74D" />
                <Typography sx={{ color: textSecondary, fontSize: "0.9rem", fontWeight: 600 }}>
                  Date Range
                </Typography>
              </Box>
              <CustomDateRangePicker
                startDate={selectedStartDate}
                endDate={selectedEndDate}
                onStartChange={handleStartDateChange}
                onEndChange={handleEndDateChange}
                disabled={isLoading}
                isDarkMode={isDarkMode}
                colors={colors}
              />
            </Box>

            {/* Generate Button */}
            <motion.button
              whileHover={{ scale: destinationWarehouse ? 1.02 : 1 }}
              whileTap={{ scale: destinationWarehouse ? 0.98 : 1 }}
              onClick={handleOpenModal}
              disabled={!destinationWarehouse}
              style={{
                background: destinationWarehouse
                  ? "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)"
                  : isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                border: "none",
                borderRadius: "14px",
                padding: "16px 32px",
                color: destinationWarehouse ? "#1D3557" : textMuted,
                fontWeight: 700,
                fontSize: "1rem",
                cursor: destinationWarehouse ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                boxShadow: destinationWarehouse ? "0 8px 25px rgba(255, 183, 77, 0.35)" : "none",
                marginTop: "8px",
              }}
            >
              <FaDownload /> Generate Report
            </motion.button>
          </Box>
        </Box>
      </motion.div>

      {/* Modern Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "16px",
            }}
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: "100%", maxWidth: "480px" }}
            >
              <Box
                sx={{
                  background: isDarkMode ? "rgba(30, 58, 95, 0.95)" : "#fff",
                  backdropFilter: "blur(20px)",
                  border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.08)",
                  borderRadius: "24px",
                  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
                  p: { xs: 3, sm: 4 },
                  textAlign: "center",
                  position: "relative",
                }}
              >
                {/* Close Button */}
                <Box
                  onClick={handleCloseModal}
                  sx={{
                    position: "absolute",
                    top: { xs: 12, sm: 16 },
                    right: { xs: 12, sm: 16 },
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    background: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: textSecondary,
                    transition: "all 0.2s",
                    "&:hover": { background: "rgba(255,100,100,0.15)", color: "#ff6b6b" },
                  }}
                >
                  <FaTimes size={16} />
                </Box>

                {/* Icon */}
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    background: "linear-gradient(135deg, rgba(74, 222, 128, 0.2) 0%, rgba(74, 222, 128, 0.05) 100%)",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                    border: "1px solid rgba(74, 222, 128, 0.3)",
                  }}
                >
                  <FaFileExcel size={36} color="#4ade80" />
                </Box>

                <Typography sx={{ color: textPrimary, fontWeight: 700, fontSize: { xs: "1.25rem", sm: "1.5rem" }, mb: 1 }}>
                  Confirm Download
                </Typography>
                <Typography sx={{ color: textSecondary, fontSize: "0.95rem", mb: 3 }}>
                  Your report is ready to download
                </Typography>

                {/* Report Details */}
                <Box
                  sx={{
                    background: detailsBg,
                    borderRadius: "16px",
                    p: { xs: 2, sm: 2.5 },
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography sx={{ color: textMuted, fontSize: "0.9rem" }}>Station</Typography>
                    <Typography sx={{ color: "#FFB74D", fontWeight: 600, fontSize: "0.9rem" }}>
                      {warehouses.find((w) => w.warehouseID === destinationWarehouse)?.name || ""}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: textMuted, fontSize: "0.9rem" }}>Date Range</Typography>
                    <Typography sx={{ color: textPrimary, fontWeight: 600, fontSize: "0.9rem" }}>
                      {formatDate(selectedStartDate, "show")} - {formatDate(selectedEndDate, "show")}
                    </Typography>
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCloseModal}
                    style={{
                      flex: 1,
                      background: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                      border: isDarkMode ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.1)",
                      borderRadius: "12px",
                      padding: "14px 20px",
                      color: textPrimary,
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </motion.button>
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={`${BASE_URL}/api/ledger/generate-excel/${destinationWarehouse}/${formatDate(selectedStartDate)}-${formatDate(selectedEndDate)}`}
                    target="_blank"
                    onClick={() => setModalOpen(false)}
                    style={{
                      flex: 1,
                      background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
                      border: "none",
                      borderRadius: "12px",
                      padding: "14px 20px",
                      color: "#1D3557",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      textDecoration: "none",
                      boxShadow: "0 8px 25px rgba(74, 222, 128, 0.3)",
                    }}
                  >
                    <FaDownload /> Download
                  </motion.a>
                </Box>
              </Box>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
