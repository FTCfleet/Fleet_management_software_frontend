import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

/**
 * Reusable Pagination Component
 * Props:
 * - currentPage: number - Current page number
 * - totalPages: number - Total number of pages
 * - onPrevious: function - Handler for previous button
 * - onNext: function - Handler for next button
 * - isLoading: boolean - Loading state
 * - showInfo: boolean - Whether to show "Showing X - Y of Z" info
 * - infoText: string - Custom info text
 * - isDarkMode: boolean - Theme mode
 * - colors: object - Theme colors
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPrevious,
  onNext,
  isLoading = false,
  showInfo = true,
  infoText = "",
  isDarkMode,
  colors,
}) => {
  const buttonStyle = {
    borderColor: isDarkMode ? "rgba(255,255,255,0.2)" : "#d1d5db",
    color: isDarkMode ? colors?.textPrimary : "#1E3A5F",
    borderRadius: "10px",
    textTransform: "none",
    px: 2,
    py: 0.75,
    minWidth: "90px",
    fontSize: "0.875rem",
    fontWeight: 500,
    "&:hover": {
      borderColor: isDarkMode ? "#FFB74D" : "#1E3A5F",
      backgroundColor: isDarkMode ? "rgba(255,183,77,0.08)" : "rgba(30,58,95,0.05)",
    },
    "&:disabled": {
      borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "#e2e8f0",
      color: isDarkMode ? "rgba(255,255,255,0.3)" : "#94a3b8",
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
        mt: 2,
        mb: 2,
      }}
    >
      {showInfo && (
        <Typography
          variant="body2"
          sx={{ color: colors?.textSecondary || "#64748b", fontSize: "0.875rem" }}
        >
          {infoText}
        </Typography>
      )}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: showInfo ? "auto" : 0 }}>
        <Button
          variant="outlined"
          onClick={onPrevious}
          disabled={currentPage <= 1 || isLoading}
          startIcon={<ChevronLeft sx={{ fontSize: "1.2rem" }} />}
          sx={buttonStyle}
        >
          Prev
        </Button>
        <Typography
          sx={{
            color: colors?.textPrimary || "#1E3A5F",
            fontWeight: 600,
            fontSize: "0.875rem",
            minWidth: "100px",
            textAlign: "center",
          }}
        >
          Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
        </Typography>
        <Button
          variant="outlined"
          onClick={onNext}
          disabled={totalPages === 0 || currentPage >= totalPages || isLoading}
          endIcon={<ChevronRight sx={{ fontSize: "1.2rem" }} />}
          sx={buttonStyle}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default Pagination;
